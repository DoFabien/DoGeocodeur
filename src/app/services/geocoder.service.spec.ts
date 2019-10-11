import { TestBed } from '@angular/core/testing';

import { GeocoderService } from './geocoder.service';

describe('GeocoderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GeocoderService = TestBed.get(GeocoderService);
    expect(service).toBeTruthy();
  });
});
