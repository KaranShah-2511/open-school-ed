import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import OpenWorkspace from './OpenWorkspace';

describe('<OpenWorkspace />', () => {
  test('it should mount', () => {
    render(<OpenWorkspace />);
    
    const openWorkspace = screen.getByTestId('OpenWorkspace');

    expect(openWorkspace).toBeInTheDocument();
  });
});