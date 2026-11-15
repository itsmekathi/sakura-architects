import * as migration_20261115_034738_initial from './20261115_034738_initial';
import * as migration_20261115_115817_add_blob_storage_fields from './20261115_115817_add_blob_storage_fields';

export const migrations = [
  {
    up: migration_20261115_034738_initial.up,
    down: migration_20261115_034738_initial.down,
    name: '20261115_034738_initial',
  },
  {
    up: migration_20261115_115817_add_blob_storage_fields.up,
    down: migration_20261115_115817_add_blob_storage_fields.down,
    name: '20261115_115817_add_blob_storage_fields'
  },
];
