import * as migration_20261115_034738_initial from './20261115_034738_initial';
import * as migration_20261115_115817_add_blob_storage_fields from './20261115_115817_add_blob_storage_fields';
import * as migration_20261115_124348_visitor_accounts_and_consent from './20261115_124348_visitor_accounts_and_consent';
import * as migration_20261115_130130_inr_budget from './20261115_130130_inr_budget';

export const migrations = [
  {
    up: migration_20261115_034738_initial.up,
    down: migration_20261115_034738_initial.down,
    name: '20261115_034738_initial',
  },
  {
    up: migration_20261115_115817_add_blob_storage_fields.up,
    down: migration_20261115_115817_add_blob_storage_fields.down,
    name: '20261115_115817_add_blob_storage_fields',
  },
  {
    up: migration_20261115_124348_visitor_accounts_and_consent.up,
    down: migration_20261115_124348_visitor_accounts_and_consent.down,
    name: '20261115_124348_visitor_accounts_and_consent',
  },
  {
    up: migration_20261115_130130_inr_budget.up,
    down: migration_20261115_130130_inr_budget.down,
    name: '20261115_130130_inr_budget'
  },
];
