import React from 'react';
import { TextInput } from '@mantine/core';

const BG_COLORS: Record<string, string> = {
    input: 'inherit',
    correct: '#0CA678',
    incorrect: '#FA5252',
  };
  
  const FONT_COLORS: Record<string, string> = {
    input: 'inherit',
    correct: 'white',
    incorrect: 'white',
  };

export default class DrillInput extends React.Component<{
    componentValue: string;
    status: string;
    className: string;
    placeholder: string;
    ref: React.MutableRefObject<any>;
    onKeyDown: React.KeyboardEventHandler<HTMLInputElement>;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
  }> {
    render() {
      return (
        <TextInput
          ref={this.props.ref}
          autoFocus
          styles={{
            input: {
              width: '100%',
              fontSize: 30,
              outline: 'none',
              textAlign: 'center',
              fontWeight: 700,
              color: FONT_COLORS[this.props.status],
              backgroundColor: BG_COLORS[this.props.status],
            },
          }}
          readOnly={this.props.status !== 'input'}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
          placeholder={this.props.placeholder}
          variant="filled"
          size="xl"
          className={this.props.className}
          onKeyDown={this.props.onKeyDown}
          onChange={this.props.onChange}
          value={this.props.componentValue}
        />
      );
    }
  }