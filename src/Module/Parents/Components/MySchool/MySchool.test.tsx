import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import MySchool from './MySchool';

describe('<MySchool />', () => {
  test('it should mount', () => {
    render(<MySchool />);

    const mySchool = screen.getByTestId('MySchool');

    expect(mySchool).toBeInTheDocument();
  });
});