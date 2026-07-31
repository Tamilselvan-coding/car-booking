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

test('one-way trips below 130 km use the 130 km minimum', () => {
  for (const distanceKm of [50, 80, 129, 130]) {
    const sedanFare = calculateFareEstimate('One Way', distanceKm, sedan);
    const suvFare = calculateFareEstimate('One Way', distanceKm, suv);

    assert.equal(sedanFare.billableKm, 130);
    assert.equal(sedanFare.totalFare, 130 * 15 + 400);
    assert.equal(suvFare.billableKm, 130);
    assert.equal(suvFare.totalFare, 130 * 20 + 400);
  }
});

test('one-way trips beyond 130 km progress at the selected per-km rate', () => {
  const sedanFare = calculateFareEstimate('One Way', 131, sedan);
  const suvFare = calculateFareEstimate('One Way', 131, suv);

  assert.equal(sedanFare.billableKm, 131);
  assert.equal(sedanFare.totalFare, 131 * 15 + 400);
  assert.equal(suvFare.billableKm, 131);
  assert.equal(suvFare.totalFare, 131 * 20 + 400);
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
