package main

import (
	"net/http"
	"os/exec"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/pkg/errors"
)

// all stat providers
var providers = []StatProvider{
	&vcgencmdStat{"measure_temp"},
	&vcgencmdStat{"measure_volts"},
	&vcgencmdStat{"get_throttled"},
	&shellStat{
		name: "mem_max",
		pipeline: []statCmd{
			{name: "free", args: []string{"-tmw"}},
			{name: "tail", args: []string{"-n", "1"}},
			{name: "awk", args: []string{"{print $2}"}},
		},
	},
	&shellStat{
		name: "mem_usage",
		pipeline: []statCmd{
			{name: "free", args: []string{"-tmw"}},
			{name: "tail", args: []string{"-n", "1"}},
			{name: "awk", args: []string{"{print $3}"}},
		},
	},
	&shellStat{
		name: "disk_usage",
		pipeline: []statCmd{
			{name: "df", args: []string{"-h"}},
			{name: "head", args: []string{"-n", "2"}},
			{name: "sed", args: []string{"1d"}},
			{name: "awk", args: []string{"{print $5}"}},
		},
	},
	&shellStat{
		name: "uptime",
		pipeline: []statCmd{
			{name: "uptime", args: []string{"-p"}},
		},
	},
}

func main() {
	e := echo.New()

	service := NewStatsService(providers)

	e.Pre(middleware.RemoveTrailingSlash())

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	root := e.Group("/pistats")

	root.GET("", indexHandler(service))
	root.GET("/reboot", rebootHandler())

	e.Logger.Fatal(e.Start(":9000"))
}

func indexHandler(s *StatsService) echo.HandlerFunc {
	return func(c echo.Context) error {
		stats, err := s.GetAllStats()
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, err)
		}

		return c.JSON(http.StatusOK, stats)
	}
}

func rebootHandler() echo.HandlerFunc {
	return func(c echo.Context) error {
		if err := exec.Command("sudo", "reboot", "now").Run(); err != nil {
			err = errors.Wrap(err, "reboot command failed")
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}

		return c.NoContent(http.StatusAccepted)
	}
}
