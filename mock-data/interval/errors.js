"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationErrors = void 0;
exports.validationErrors = {
    requiredStartDateError: "must have required property 'startDate'",
    requiredEndDateError: "must have required property 'endDate'",
    requiredVehicleIdError: "must have required property 'vehicleId'",
    startDateGreaterThanEndDate: 'must pass "start-date-is-before-end-date" keyword validation',
    startDateMustMatchFormat: 'startDate must match format "date-time"',
    endDateMustMatchFormat: 'endDate must match format "date-time"',
};
