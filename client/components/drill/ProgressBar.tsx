import React from 'react';
import { Box } from '@mantine/core';

export default class ProgressBar extends React.Component<{ progress: number }> {
  render() {
    return (
      <Box
        style={{
          height: 5,
          width: '100%',
        }}
        sx={(theme) => ({
          backgroundColor:
            theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[2],
        })}
      >
        <Box
          style={{
            height: 5,
            width: `${this.props.progress}%`,
          }}
          sx={(theme) => ({
            backgroundColor:
              theme.colorScheme === 'light' ? theme.colors.dark[6] : theme.colors.gray[2],
          })}
        ></Box>
      </Box>
    );
  }
}
