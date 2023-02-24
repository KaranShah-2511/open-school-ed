import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import CsvUpload from './CsvUpload';

describe('<CsvUpload />', () => {
  test('it should mount', () => {
    render(<CsvUpload />);

    const csvUpload = screen.getByTestId('CsvUpload');

    expect(csvUpload).toBeInTheDocument();
  });
});