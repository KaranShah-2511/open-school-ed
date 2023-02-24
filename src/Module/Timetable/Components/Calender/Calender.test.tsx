import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Calender from './Calender';

describe('<Calender />', () => {
  test('it should mount', () => {
    render(<Calender />);
    
    const calender = screen.getByTestId('Calender');

    expect(calender).toBeInTheDocument();
  });
});