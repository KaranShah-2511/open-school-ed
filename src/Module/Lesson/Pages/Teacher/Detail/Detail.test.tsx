import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Detail from './Detail';

describe('<Detail />', () => {
  test('it should mount', () => {
    render(<Detail />);
    
    const lessonDetail = screen.getByTestId('Detail');

    expect(lessonDetail).toBeInTheDocument();
  });
});