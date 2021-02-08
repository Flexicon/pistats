package main

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
	stats := make(map[string]string, len(s.Providers))

	for _, p := range s.Providers {
		value, err := p.Get()
		if err != nil {
			stats[p.Name()] = err.Error()
			continue
		}
		stats[p.Name()] = value
	}

	return stats, nil
}
