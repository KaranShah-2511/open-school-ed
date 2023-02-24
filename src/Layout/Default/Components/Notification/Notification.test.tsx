import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Notification from './Notification';

describe('<Notification />', () => {
  test('it should mount', () => {
    render(<Notification />);

    const notification = screen.getByTestId('Notification');

    expect(notification).toBeInTheDocument();
  });
});