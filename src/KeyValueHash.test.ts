import {expect} from 'chai';
import KeyValueHash from './KeyValueHash';
import KeyValueNode from 'key-value-node';

describe(`KeyValueHash`,()=>{

  let obj = {

    foo:{

      bar:Symbol(),
      baz:[
        {qux:Symbol()},
        {qux:Symbol()},
      ]

    },

    quux:[1,2,3]

  }

  let keyValueHash:KeyValueHash<typeof obj>;
  

  beforeEach(()=>{

    obj = {

      foo:{

        bar:Symbol(),
        baz:[
          {qux:Symbol()},
          {qux:Symbol()},
        ]

      },

      quux:[1,2,3]

    }

    keyValueHash = new KeyValueHash(obj);

  })

  describe('Instaniation',()=>{

    it(`Is Iterable<Key, @value>, breadth first key/value hash map of object.`,()=>{

      const expectedPathValues = [
        ['foo',obj.foo],
        ['quux',obj.quux],
        ['foo.bar',obj.foo.bar],
        ['foo.baz',obj.foo.baz],
        ['quux.0',obj.quux[0]],
        ['quux.1',obj.quux[1]],
        ['quux.2',obj.quux[2]],
        ['foo.baz.0',obj.foo.baz[0]],
        ['foo.baz.1',obj.foo.baz[1]],
        ['foo.baz.0.qux',obj.foo.baz[0].qux],
        ['foo.baz.1.qux',obj.foo.baz[1].qux],
      ];

      let i = 0;

      for(const [key, val] of keyValueHash){

        let [path, value] = expectedPathValues[i];

        expect(key.pathNotation.toString()).to.equal(path);

        expect(val).to.equal(value);

        i++;

      }

      expect(i).to.equal(keyValueHash.size);

    });

  });

  describe('Accessors',()=>{

    describe(`size`,()=>{

      it(`Returns number of key/value pair in the object.`,()=>{

        const expectedKeyValuePairs = 11;

        expect(keyValueHash).property('size').to.equal(expectedKeyValuePairs);

      });

    });

    describe(`srcObject`,()=>{

      it(`Returns source object passed to the constructor.`,()=>{

        expect(keyValueHash).property('srcObject').to.equal(obj);

      });

    });

  });

  describe('Methods',()=>{

    describe(`keys`,()=>{

      it(`Returns IterableIterator<Key>, breadth first key hash map of object.`,()=>{

        const expectedPathValues = [
          ['foo',obj.foo],
          ['quux',obj.quux],
          ['foo.bar',obj.foo.bar],
          ['foo.baz',obj.foo.baz],
          ['quux.0',obj.quux[0]],
          ['quux.1',obj.quux[1]],
          ['quux.2',obj.quux[2]],
          ['foo.baz.0',obj.foo.baz[0]],
          ['foo.baz.1',obj.foo.baz[1]],
          ['foo.baz.0.qux',obj.foo.baz[0].qux],
          ['foo.baz.1.qux',obj.foo.baz[1].qux],
        ];

        let i = 0;

        for(const key of keyValueHash.keys()){

          let [path] = expectedPathValues[i];

          expect(key.pathNotation.toString()).to.equal(path);

          i++;

        }

        expect(i).to.equal(keyValueHash.size);

      });

      it(`Takes optional key literal filters.`,()=>{

        const filters = ['bar', 1];

        const expectedPathValues = [
          ['foo.bar',obj.foo.bar],
          ['quux.1',obj.quux[1]],
          ['foo.baz.1',obj.foo.baz[1]],
        ];

        let i = 0;

        for(const key of keyValueHash.keys(...filters)){

          let [path] = expectedPathValues[i];

          expect(key.pathNotation.toString()).to.equal(path);

          i++;

        }

        expect(i).to.equal(expectedPathValues.length);

      });

      it(`Takes partial dot-notated path filters with the last key being the target key literal.`,
        ()=>{

        const filters = ['0.qux', 'quux.2'];

        const expectedPathValues = [
          ['foo.baz.0.qux',obj.foo.baz[0].qux],
          ['quux.2',obj.quux[2]]
        ];

        let i = 0;

        for(const key of keyValueHash.keys(...filters)){

          let [path] = expectedPathValues[i];

          expect(key.pathNotation.toString()).to.equal(path);

          i++;

        }

        expect(i).to.equal(expectedPathValues.length);

      });

      it(`Dot-notated path filters can contain a wildcard key "*".`,()=>{

        let obj = {

          foo:{

            bar:[
              {qux:Symbol()},
              {qux:Symbol()},
            ],
            baz:[
              {qux:Symbol()},
              {qux:Symbol()},
            ]

          },

          quux:[1,2,3]

        }

        let keyValueHash = new KeyValueHash(obj);

        const filters = ['baz.*.qux'];

        const expectedPathValues = [
          ['foo.baz.0.qux',obj.foo.baz[0].qux],
          ['foo.baz.1.qux',obj.foo.baz[1].qux],
        ];

        let i = 0;

        for(const key of keyValueHash.keys(...filters)){

          let [path] = expectedPathValues[i];

          expect(key.pathNotation.toString()).to.equal(path);

          i++;

        }

        expect(i).to.equal(expectedPathValues.length);

      });

      it(`Less specifc filters along the same path will overide more specific filters.`,()=>{

        const filters = ['0.qux', 'qux', '1.qux'];

        const expectedPathValues = [
          ['foo.baz.0.qux',obj.foo.baz[0].qux],
          ['foo.baz.1.qux',obj.foo.baz[1].qux]
        ];

        let i = 0;

        for(const key of keyValueHash.keys(...filters)){

          let [path] = expectedPathValues[i];

          expect(key.pathNotation.toString()).to.equal(path);

          i++;

        }

        expect(i).to.equal(expectedPathValues.length);

      });

      it(`Does not return node multiple times when node matches mutiple filters.`,()=>{

        const filters = ['1.qux', '*.qux'];

        const expectedPathValues = [
          ['foo.baz.1.qux',obj.foo.baz[1].qux],
          ['foo.baz.0.qux',obj.foo.baz[0].qux]
        ];

        const results = [];

        for(const result of keyValueHash.keys(...filters)){

          results.push([result.pathNotation.toString(), result.value]);

        }

        expect(results).to.have.lengthOf(expectedPathValues.length);

        expect(results).to.deep.equal(expectedPathValues);

      });

    });

    describe(`entries`,()=>{

      it(`Returns IterableIterator<Key, @value>, breadth first key/value hash map of object.`,()=>{

        const expectedPathValues = [
          ['foo',obj.foo],
          ['quux',obj.quux],
          ['foo.bar',obj.foo.bar],
          ['foo.baz',obj.foo.baz],
          ['quux.0',obj.quux[0]],
          ['quux.1',obj.quux[1]],
          ['quux.2',obj.quux[2]],
          ['foo.baz.0',obj.foo.baz[0]],
          ['foo.baz.1',obj.foo.baz[1]],
          ['foo.baz.0.qux',obj.foo.baz[0].qux],
          ['foo.baz.1.qux',obj.foo.baz[1].qux],
        ];

        let i = 0;

        for(const [key, val] of keyValueHash.entries()){

          let [path, value] = expectedPathValues[i];

          expect(key.pathNotation.toString()).to.equal(path);

          expect(val).to.equal(value);

          i++;

        }

        expect(i).to.equal(keyValueHash.size);

      });

      it(`Takes optional key filters and runs through 'keys' method to filters results.`,()=>{

        const filters = ['bar', 1];

        const expectedPathValues = [
          ['foo.bar',obj.foo.bar],
          ['quux.1',obj.quux[1]],
          ['foo.baz.1',obj.foo.baz[1]],
        ];

        let i = 0;

        for(const [key, val] of keyValueHash.entries(...filters)){

           let [path, value] = expectedPathValues[i];

          expect(key.pathNotation.toString()).to.equal(path);

          expect(val).to.equal(value);

          i++;

        }

        expect(i).to.equal(expectedPathValues.length);

      });

    });

    describe(`values`,()=>{

      it(`Returns IterableIterator<@value>, breadth first value of keys.`,()=>{

        const expectedPathValues = [
          ['foo',obj.foo],
          ['quux',obj.quux],
          ['foo.bar',obj.foo.bar],
          ['foo.baz',obj.foo.baz],
          ['quux.0',obj.quux[0]],
          ['quux.1',obj.quux[1]],
          ['quux.2',obj.quux[2]],
          ['foo.baz.0',obj.foo.baz[0]],
          ['foo.baz.1',obj.foo.baz[1]],
          ['foo.baz.0.qux',obj.foo.baz[0].qux],
          ['foo.baz.1.qux',obj.foo.baz[1].qux],
        ];

        let i = 0;

        for(const value of keyValueHash.values()){

          let [,val] = expectedPathValues[i];

         

        expect(val).to.equal(value);

          i++;

        }

        expect(i).to.equal(keyValueHash.size);

      });

      it(`Takes optional key filters and runs through 'keys' method to filters results.`,()=>{

        const filters = ['bar', 1];

        const expectedPathValues = [
          ['foo.bar',obj.foo.bar],
          ['quux.1',obj.quux[1]],
          ['foo.baz.1',obj.foo.baz[1]],
        ];

        let i = 0;

        for(const val of keyValueHash.values(...filters)){

           let [, value] = expectedPathValues[i];

          expect(val).to.equal(value);

          i++;

        }

        expect(i).to.equal(expectedPathValues.length);

      });

    });

    describe('rootKeys',()=>{

      it(`Returns IterableIterator<root-KeyValueNode>, direct keys of object.`,()=>{

        const expectedPathValues = [
          ['foo',obj.foo],
          ['quux',obj.quux],
        ];

        let i = 0;

        for(const rootKey of keyValueHash.rootKeys()){

          let [path] = expectedPathValues[i];

          expect(rootKey).to.be.instanceof(KeyValueNode);
          expect(rootKey).property('IS_ROOT_KEY').to.be.true;

          expect(rootKey.pathNotation.toString()).to.equal(path);

          i++;

        }

        expect(i).to.equal(Object.keys(obj).length);

      });

    });

    describe('has',()=>{

      it(`Returns true when key exsists in hash.`,()=>{

        const DNE = new KeyValueNode('DNE',new Map(),{});

        expect(keyValueHash.has(DNE)).to.be.false

        let i = 0;

        for(const key of keyValueHash.keys()){

          expect(keyValueHash.has(key)).to.be.true

          i++;

        }

        expect(i).to.equal(keyValueHash.size);

      });

    });

  });

});