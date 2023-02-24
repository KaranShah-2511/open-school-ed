import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import PupilRegistration from './PupilRegistration';

describe('<PupilRegistration />', () => {
  test('it should mount', () => {
    render(<PupilRegistration />);

    const pupilRegistration = screen.getByTestId('PupilRegistration');

    expect(pupilRegistration).toBeInTheDocument();
  });
});