import Key from './Key';
import RootKey from './RootKey';

function* entries(obj):IterableIterator<[string | number, any]>{

  if(Array.isArray(obj)){

    yield* obj.entries();

  } else {

    const hasOwnProp = 
      <(key:PropertyKey)=>boolean>Object.prototype.hasOwnProperty.bind(obj);
    const isEnumerable = 
      <(key:PropertyKey)=>boolean>Object.prototype.propertyIsEnumerable.bind(obj);

    for(let key in obj){

      if(hasOwnProp(key) && isEnumerable(key)){

        yield [key, obj[key]];

      }

    }

  }

}

const KEY_VALUE_MAP:unique symbol = Symbol();
const ROOT_KEYS:unique symbol = Symbol();
const OBJECT_KEY:unique symbol = Symbol();

export default class KeyValueHash<TsrcObj extends object| any[] = object| any[]> {

  private readonly [KEY_VALUE_MAP]: Map<Key, any>;
  private readonly [ROOT_KEYS]:Set<RootKey>;
  private readonly [OBJECT_KEY]:TsrcObj;

  constructor(objToHash:TsrcObj){

    const keyValueMap = new Map<Key, any>();
    const rootKeys = new Set<RootKey>();

    //Root Keys
    for(const [k, val] of entries(objToHash)){

      const rootKey = new RootKey(k.toString(), rootKeys);

      keyValueMap.set(rootKey, val);

    }

    for(const [pKey, pKeyVal] of keyValueMap){
      
      if(typeof pKeyVal === 'object' && pKeyVal !== null){

        for(const [k, val] of entries(pKeyVal)){

          const key = new Key(k.toString(), pKey);

          keyValueMap.set(key, val);

        }

      }

    }

    this[KEY_VALUE_MAP] = keyValueMap;
    this[ROOT_KEYS] = rootKeys;
    this[OBJECT_KEY] = objToHash;

  }

  //Accessors
  get size():Number{

    return this[KEY_VALUE_MAP].size;

  }

  get srcObject():TsrcObj{

    return this[OBJECT_KEY];

  }

  //Methods
  entries():IterableIterator<[Key, any]>{

    return this[KEY_VALUE_MAP].entries();
  
  }
 
  keys():IterableIterator<Key>{
  
    return this[KEY_VALUE_MAP].keys();
  
  }
 
  values():IterableIterator<any>{
  
    return this[KEY_VALUE_MAP].values();
  
  }

  rootKeys():IterableIterator<RootKey>{

    return this[ROOT_KEYS].values();

  }

  [Symbol.iterator]():IterableIterator<[Key, any]>{

    return this[KEY_VALUE_MAP][Symbol.iterator]();

  }

  get [Symbol.toStringTag]() {
  
    return this.constructor.name;
  
  }

}