package main

import (
	"bytes"
	"io"
	"os/exec"
	"strings"

	"github.com/pkg/errors"
)

// StatProvider - provides access to a stat
type StatProvider interface {
	Name() string
	Get() (string, error)
}

// vcgencmdStat to read different vcgencmd measures
type vcgencmdStat struct {
	name string
}

func (s *vcgencmdStat) Name() string {
	return s.name
}

func (s *vcgencmdStat) Get() (string, error) {
	output, err := exec.Command("vcgencmd", s.name).Output()
	if err != nil {
		return "", err
	}

	val, err := RawValueFromReading(string(output))
	if err != nil {
		return "", err
	}

	return val, nil
}

// shellStat to read a value from a pipeline of shell commands
type shellStat struct {
	name     string
	pipeline []statCmd
}

func (s *shellStat) Name() string {
	return s.name
}

func (s *shellStat) Get() (string, error) {
	var outputBuf, errorBuf bytes.Buffer
	stack := s.pipelineToExecCmds()
	pipeStack := make([]*io.PipeWriter, len(stack)-1)

	i := 0
	for ; i < len(stack)-1; i++ {
		stdinPipe, stdoutPipe := io.Pipe()
		stack[i].Stdout = stdoutPipe
		stack[i].Stderr = &errorBuf
		stack[i+1].Stdin = stdinPipe
		pipeStack[i] = stdoutPipe
	}
	stack[i].Stdout = &outputBuf
	stack[i].Stderr = &errorBuf

	if err := s.call(stack, pipeStack); err != nil {
		err = errors.Wrap(err, string(errorBuf.Bytes()))
		return "", err
	}

	return strings.TrimSpace(string(outputBuf.Bytes())), nil
}

func (s *shellStat) call(stack []*exec.Cmd, pipes []*io.PipeWriter) (err error) {
	if stack[0].Process == nil {
		if err = stack[0].Start(); err != nil {
			return err
		}
	}
	if len(stack) > 1 {
		if err = stack[1].Start(); err != nil {
			return err
		}
		defer func() {
			if err == nil {
				pipes[0].Close()
				err = s.call(stack[1:], pipes[1:])
			}
		}()
	}
	return stack[0].Wait()
}

func (s *shellStat) pipelineToExecCmds() []*exec.Cmd {
	commands := make([]*exec.Cmd, len(s.pipeline))
	for i, cmd := range s.pipeline {
		commands[i] = cmd.ToExec()
	}

	return commands
}

// statCmd represents a singular shell command for a shellStat pipeline
type statCmd struct {
	name string
	args []string
}

func (c *statCmd) ToExec() *exec.Cmd {
	return exec.Command(c.name, c.args...)
}

// RawValueFromReading parses out a raw value from a raw reading passed in the format of "reading_key=reading_value"
func RawValueFromReading(raw string) (string, error) {
	parts := strings.Split(raw, "=")
	if len(parts) < 2 {
		return "", errors.New("invalid reading format")
	}

	return strings.TrimSpace(parts[1]), nil
}
