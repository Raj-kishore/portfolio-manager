import { TestBed } from '@angular/core/testing';

import { ApiCommonService } from './api-common.service';

describe('ApiCommonService', () => {
  let service: ApiCommonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiCommonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
