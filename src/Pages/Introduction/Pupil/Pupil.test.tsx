import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Pupil from './Pupil';

describe('<Pupil />', () => {
  test('it should mount', () => {
    render(<Pupil />);

    const pupil = screen.getByTestId('Pupil');

    expect(pupil).toBeInTheDocument();
  });
});