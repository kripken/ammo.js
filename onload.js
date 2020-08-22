Module['CONTACT_ADDED_CALLBACK_SIGNATURE'] = 'iiiiiiii';
Module['CONTACT_DESTROYED_CALLBACK_SIGNATURE'] = 'ii';
Module['CONTACT_PROCESSED_CALLBACK_SIGNATURE'] = 'iiii';
Module['INTERNAL_TICK_CALLBACK_SIGNATURE'] = 'vif';

// Reassign global Ammo to the loaded module:
this['Ammo'] = Module;
