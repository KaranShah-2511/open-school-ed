import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import SubmittedMarked from './SubmittedMarked';

describe('<SubmittedMarked />', () => {
  test('it should mount', () => {
    render(<SubmittedMarked />);
    
    const submittedMarked = screen.getByTestId('SubmittedMarked');

    expect(submittedMarked).toBeInTheDocument();
  });
});