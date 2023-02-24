import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import AddEventModel from './AddEventModel';

describe('<AddEventModel />', () => {
  test('it should mount', () => {
    render(<AddEventModel />);

    const addEventModel = screen.getByTestId('AddEventModel');

    expect(addEventModel).toBeInTheDocument();
  });
});