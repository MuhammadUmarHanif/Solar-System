import { render, screen } from '@testing-library/react';
import App from './App';

test('renders site brand', () => {
  render(<App />);
  expect(screen.getByText(/solar guidance/i)).toBeTruthy();
});
