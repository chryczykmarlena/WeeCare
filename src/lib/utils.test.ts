import { describe, it, expect } from 'vitest';
import { calculateAge } from './utils';

describe('calculateAge', () => {
    it('calculates age correctly for a birthday that has already occurred this year', () => {
        const today = new Date();
        const dob = new Date(today.getFullYear() - 5, today.getMonth() - 1, today.getDate()).toISOString().split('T')[0];
        expect(calculateAge(dob)).toBe(5);
    });

    it('calculates age correctly for a birthday that has not yet occurred this year', () => {
        const today = new Date();
        const dob = new Date(today.getFullYear() - 5, today.getMonth() + 1, today.getDate()).toISOString().split('T')[0];
        expect(calculateAge(dob)).toBe(4);
    });

    it('calculates age correctly for a birthday today', () => {
        const today = new Date();
        const dob = today.toISOString().split('T')[0];
        expect(calculateAge(dob)).toBe(0);
    });

    it('calculates age correctly for a birth date in the future', () => {
        const today = new Date();
        const dob = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()).toISOString().split('T')[0];
        expect(calculateAge(dob)).toBe(-1);
    });

    it('calculates age correctly for leap years', () => {
        // Assuming today is not a leap year or handling it generally
        // Since calculateAge uses new Date() internally, it's hard to test specific "today" without mocking.
        // This test is a placeholder for future implementation with date mocking
    });
});
