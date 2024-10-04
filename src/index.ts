import { defineInterface } from '@directus/extensions-sdk';
import InterfaceComponent from './interface.vue';

export default defineInterface({
  id: 'm2o-searchable-dropdown',
  name: 'M2O 单向下拉选择',
  icon: 'dropdown',

  description: 'This is my custom interface!',
  component: InterfaceComponent,
  options: ({ relations }) => {
    const collection = relations.m2o?.related_collection;
    return [
      {
        field: 'template',
		    name:'模板',
        meta: {
          interface: 'system-display-template',
          options: {
            collectionName: collection,
          },
          width: 'full',
        },
      },
      {
        field: 'placeholder',
        type: 'string',
        name: 'Placeholder',
        meta: {
          interface: 'input',
          width: 'half',
          options: {
            placeholder: '输入占位符号',
          },
        },
      },
      {
        field: 'filter',
        name: '筛选',
        type: 'json',
        meta: {
          interface: 'system-filter',
          options: {
            collectionName: collection,
          },
		  width: 'half',
        },
      },
    ];
  },
  types: ['string', 'uuid', 'text', 'integer', 'bigInteger'],
  localTypes: ['m2o'],
  group:'other',
  relational: true,
  recommendedDisplays: ['related-values'],
});
