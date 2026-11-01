import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateFareEstimate,
  farePolicy,
  vehicleRates,
} from '../src/content.ts';

const sedan = vehicleRates.find((vehicle) => vehicle.name === 'Sedan');
const suv = vehicleRates.find((vehicle) => vehicle.name === 'SUV');

assert.ok(sedan, 'Sedan tariff must exist');
assert.ok(suv, 'SUV tariff must exist');

test('one-way trips below 100 km use the 100 km minimum', () => {
  for (const distanceKm of [50, 80, 99, 100]) {
    const sedanFare = calculateFareEstimate('One Way', distanceKm, sedan);
    const suvFare = calculateFareEstimate('One Way', distanceKm, suv);

    assert.equal(sedanFare.billableKm, 100);
    assert.equal(sedanFare.totalFare, 100 * 15 + 400);
    assert.equal(suvFare.billableKm, 100);
    assert.equal(suvFare.totalFare, 100 * 20 + 400);
  }
});

test('one-way trips beyond 100 km progress at the selected per-km rate', () => {
  const sedanFare = calculateFareEstimate('One Way', 101, sedan);
  const suvFare = calculateFareEstimate('One Way', 101, suv);

  assert.equal(sedanFare.billableKm, 101);
  assert.equal(sedanFare.totalFare, 101 * 15 + 400);
  assert.equal(suvFare.billableKm, 101);
  assert.equal(suvFare.totalFare, 101 * 20 + 400);
});

test('driver bata is added exactly once to every estimate', () => {
  for (const vehicle of vehicleRates) {
    for (const distanceKm of [50, 130, 350]) {
      const fare = calculateFareEstimate('One Way', distanceKm, vehicle);

      assert.equal(fare.driverBata, farePolicy.driverBata);
      assert.equal(fare.totalFare - fare.baseFare, farePolicy.driverBata);
    }
  }
});
