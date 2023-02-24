import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import SubmittedList from './SubmittedList';

describe('<SubmittedList />', () => {
  test('it should mount', () => {
    render(<SubmittedList />);

    const submittedList = screen.getByTestId('SubmittedList');

    expect(submittedList).toBeInTheDocument();
  });
});