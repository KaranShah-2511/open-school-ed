import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import EventModel from './EventModel';

describe('<EventModel />', () => {
  test('it should mount', () => {
    render(<EventModel />);

    const eventModel = screen.getByTestId('EventModel');

    expect(eventModel).toBeInTheDocument();
  });
});