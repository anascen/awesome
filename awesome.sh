#!/usr/bin/env sh
if [ -z "$awesome_skip_init" ]; then
  debug() {
    if [ "$AWESOME_DEBUG" = "1" ]; then
      echo "awesome (debug) - $1"
    fi
  }

  readonly hook_name="${0##*/}"
  debug "starting $hook_name..."

  if [ "$AWESOME" = "0" ]; then
    debug "AWESOME env variable is set to 0, skipping hook"
    exit 0
  fi

  for file in "${XDG_CONFIG_HOME:-$HOME/.config}/awesome/init.sh" "$HOME/.awesomerc.sh"; do
    if [ -f "$file" ]; then
      debug "sourcing $file"
      . "$file"
      break
    fi
  done

  readonly awesome_skip_init=1
  export awesome_skip_init

  if [ "${SHELL##*/}" = "zsh" ]; then
    zsh --emulate sh -e "$0" "$@"
  else
    sh -e "$0" "$@"
  fi
  exitCode="$?"

  if [ $exitCode != 0 ]; then
    echo "awesome - $hook_name hook exited with code $exitCode (error)"
  fi

  if [ $exitCode = 127 ]; then
    echo "awesome - command not found in PATH=$PATH"
  fi

  exit $exitCode
fi