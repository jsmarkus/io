import t from 'tcomb';
import PromiseCache from './PromiseCache';
import BatchLoader from './BatchLoader';

export default class DataSource {
  constructor({api}) {
    this.api = this.createApiResource(api);
  }

  get idField() {
    return 'id';
  }

  get idFieldPlurals() {
    return 'ids';
  }

  get cacheTtl() {
    return 60000;
  }
  get createApiResource() {
    abstract();
  }
  get model() {
    abstract();
  }

  get getListDecode() {
    return pass;
  }
  get getItemDecode() {
    return pass;
  }

  get batchLoader() {
    return this._batchLoader || (this._batchLoader = this.createBatchLoader());
  }

  createBatchLoader() {
    return new BatchLoader({
      idField: this.idField,
      idFieldPlurals: this.idFieldPlurals,
      getList: this.getList.bind(this),
      cacheKey: this.cacheKey.bind(this),
      cache: this.constructor.cache,
    });
  }

  getList(params = {}) {
    return this.cached(
      'getList',
      params,

      () => this.api.list(params)
        .then((raw)=>this.getListDecode(raw, params))
        .then(this.assertArray.bind(this))
        .then(this.toModelList.bind(this))
    )
  }

  get(params = {}) {
    return this.cached(
      'get',
      params,

      () => this.api.item(params)
        .then((raw)=>this.getItemDecode(raw, params))
        .then(this.toModel.bind(this))
    )
  }

  getById(id) {
    return this.get({
      [this.idField]: id
    });
  }

  resolveLinkedItems(items) {
    //TODO
  }

  assertArray(data) {
    if (!t.Arr.is(data)) {
      throw new TypeError('Array expected');
    }
    return data;
  }

  toModelList(rawList) {
    return rawList.map((rawItem) => this.toModel(rawItem));
  }

  toModel(rawItem) {
    return this.model(rawItem);
  }

  cached(staticKey, dynamicKey, fn) {
    var key = this.cacheKey(staticKey, dynamicKey);
    return PromiseCache(this.constructor.cache, key, this.cacheTtl, fn);
  }

  cacheKey(staticKey, dynamicKey) {
    return `${ staticKey }.${ JSON.stringify(dynamicKey) }`;
  }

  callApi(method, params) {
    return method(params);
  }

  get cache() {
    return this.constructor.cache;
  }

  static get cache() {
    abstract();
  }
}


function pass(data) {
  return data;
}

function abstract(data) {
  throw new Error('abstract method');
}
