import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import VideoPopUp from './VideoPopUp';

describe('<VideoPopUp />', () => {
  test('it should mount', () => {
    render(<VideoPopUp />);
    
    const videoPopUp = screen.getByTestId('VideoPopUp');

    expect(videoPopUp).toBeInTheDocument();
  });
});