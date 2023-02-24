import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import MyTimetable from './MyTimetable';

describe('<MyTimetable />', () => {
  test('it should mount', () => {
    render(<MyTimetable />);

    const myTimetable = screen.getByTestId('MyTimetable');

    expect(myTimetable).toBeInTheDocument();
  });
});