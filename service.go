package main

import "sync"

// StatsService for fetching any and all stats of the RPi
type StatsService struct {
	Providers []StatProvider
}

// NewStatsService constructor
func NewStatsService(p []StatProvider) *StatsService {
	return &StatsService{p}
}

// GetAllStats from all existing Providers
func (s *StatsService) GetAllStats() (map[string]string, error) {
	var wg sync.WaitGroup
	stats := make(map[string]string, len(s.Providers))

	for _, p := range s.Providers {
		wg.Add(1)
		go func(p StatProvider) {
			defer wg.Done()
			result, err := p.Get()
			if err != nil {
				result = err.Error()
			}
			stats[p.Name()] = result
		}(p)
	}
	wg.Wait()

	return stats, nil
}
