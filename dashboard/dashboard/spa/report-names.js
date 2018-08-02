/* Copyright 2018 The Chromium Authors. All rights reserved.
   Use of this source code is governed by a BSD-style license that can be
   found in the LICENSE file.
*/
'use strict';
tr.exportTo('cp', () => {
  class ReportNamesRequest extends cp.RequestBase {
    get url_() {
      // The ReportHandler doesn't use this query parameter, but it helps caches
      // (such as the browser cache) understand that it returns different data
      // depending on whether the user is authorized to access internal data.
      const internal = this.headers_.has('Authorization');
      return '/api/report/names' + (internal ? '?internal' : '');
    }

    async localhostResponse_() {
      return [
        {name: cp.ReportSection.DEFAULT_NAME, id: 0, modified: 0},
      ];
    }
  }

  class ReportNamesCache extends cp.CacheBase {
    computeCacheKey_() {
      return 'reportTemplateIds';
    }

    get isInCache_() {
      return this.rootState_[this.cacheKey_] !== undefined;
    }

    async readFromCache_() {
      // The cache entry may be a promise: see onStartRequest_().
      return await this.rootState_[this.cacheKey_];
    }

    createRequest_() {
      return new ReportNamesRequest({});
    }

    onStartRequest_(request) {
      cp.ElementBase.actions.updateObject('', {
        [this.cacheKey_]: request.response,
      })(this.dispatch_, this.getState_);
    }

    onFinishRequest_(result) {
      cp.ElementBase.actions.updateObject('', {
        [this.cacheKey_]: result,
      })(this.dispatch_, this.getState_);
    }
  }

  const ReadReportNames = () => async(dispatch, getState) =>
    await new ReportNamesCache({}, dispatch, getState).read();

  return {
    ReadReportNames,
  };
});