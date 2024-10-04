<script lang="ts" setup>

import { ref, computed, toRaw } from 'vue';
import { useApi, useStores } from '@directus/extensions-sdk';
import './types.d.ts'




const props = defineProps({
	disabled: {
		type: Boolean,
		default: false,
	},
	collection: {
		type: String,
		required: true,
	},
	field: {
		type: String,
		required: true,
	},
	value: {
		type: [String, Number],
		default: null,
	},
	placeholder: {
		type: String,
		default: 'Select an item',
	},
	template: {
		type: String,
		default: 'name',
	},
	width: {
		type: String,
		required: true,
	},
	filter: {
		type: Object,
		default: null,
	},
});



const api = useApi();
const { useCollectionsStore, useRelationsStore, useFieldsStore } = useStores();
const collectionsStore = useCollectionsStore();
const relationsStore = useRelationsStore();
const fieldsStore = useFieldsStore();

function useRelation() {
	const relation = computed(() => {
		// console.log('110 relation = ', toRaw(relationsStore.getRelationForField(props.collection, props.field)))
		return relationsStore.getRelationForField(props.collection, props.field);
	})

	const relatedCollection = computed(() => {
		if (!relation.value?.related_collection) return null;
		return collectionsStore.getCollection(relation.value!.related_collection);
	})

	return { relatedCollection }
}

const { relatedCollection } = useRelation();
const displayerField = props.template.replace('{{', '').replace('}}', '');
// console.log(125, toRaw(relatedCollection.value))
const primaryKey = fieldsStore.getPrimaryKeyFieldForCollection(relatedCollection.value.collection);
// console.log(127,primaryKey)

const results = ref([]);
const searchQuery = ref('');


const fetchResults = async () => {
	// console.log('fetch')

	try {

		
		const response = await api.get(`/items/${relatedCollection.value.collection}`, {
			params: {
				limit: -1,
				filter:props.filter,
				search: searchQuery.value && searchQuery.value != props.value ? searchQuery.value : '',
				
			},
		})

		results.value = response.data.data;

		if (props.value != null && searchQuery.value == '') {
			const fetchName = await api.get(`items/${relatedCollection.value.collection}/${props.value}`);
			searchQuery.value = outputFields(fetchName.data.data);
		}

		// console.log('152',response,searchQuery.value) 
	}
	catch (e) {
		// console.error(e);
		throw Error(e)
	}
}

fetchResults()







const outputFields = (item)=>{
	// console.log('outputFields call item = ',item)
	let displayTemplate = props.template;
	let replace = '';

	Object.keys(item).forEach((key)=>{
		replace = `{{${key}}}`;
		displayTemplate = displayTemplate.replace(replace, item[key])
	});

	return displayTemplate
}


const debounceTimer = ref< ReturnType<typeof setTimeout> | null>();

const onInput=()=>{
	if (debounceTimer.value) {
        clearTimeout(debounceTimer.value);
    }

	debounceTimer.value = setTimeout(() => {
        fetchResults();
        debounceTimer.value = null;
    }, 500);
}

const setDropdown=(item)=>{
	if (item == null){
		searchQuery.value = '';
		
		emit('input', item)
	}
	else {
		searchQuery.value = outputFields(item);
		emit('input', item[primaryKey!.field])
	}

	fetchResults()
}






const emit = defineEmits(['input'])
</script>

<template>
	<div class="relative">
		{{ 
			JSON.stringify(props,null,2)
			}}

			{{ searchQuery }}
	</div>
	<v-menu attached :disabled="disabled" :close-on-content-click="true">
		<template #activator="{ active, activate }">
			<v-input
				v-model="searchQuery"
				:disabled="disabled"
				:placeholder="placeholder"
				:class="{ 'has-value': value }"
				:nullable="false"
				@focus="activate"
				@update:model-value="onInput"
			>
				<template #append>
					<v-icon v-if="value !== null" clickable name="close" @click="setDropdown(null)" />
					<v-icon
						v-else
						clickable
						name="expand_more"
						class="open-indicator"
						:class="{ open: active }"
						@click="activate"
					/>
				</template>
			</v-input>
		</template>

		<div class="content" :class="width">
			<v-list class="list">
				<v-list-item :disabled="value === null" @click="setDropdown(null)">
					<v-list-item-content>Deselect</v-list-item-content>
					<v-list-item-icon>
						<v-icon name="close" />
					</v-list-item-icon>
				</v-list-item>
				<v-divider />

			
					<v-list-item
					v-for="(item, index) in results"
					:key="item[primaryKey!.field] + index"
					:active="value === item[primaryKey!.field]"
					:disabled="disabled"
					@click="setDropdown(item)"
				>
					<v-list-item-content>
						<span class="item-text">{{ outputFields(item) }}</span>
					</v-list-item-content>
				</v-list-item>
			</v-list>
		</div>
	</v-menu>
</template>
