import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import PupilConnectionCode from './PupilConnectionCode';

describe('<PupilConnectionCode />', () => {
  test('it should mount', () => {
    render(<PupilConnectionCode />);

    const pupilConnectionCode = screen.getByTestId('PupilConnectionCode');

    expect(pupilConnectionCode).toBeInTheDocument();
  });
});