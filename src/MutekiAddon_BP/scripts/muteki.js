// @ts-check

import { world, system, EntityComponentTypes, EquipmentSlot, EntityEquippableComponent, Player } from "@minecraft/server";

const mutekiCatalyst = `mutekiaddon:muteki_catalyst`;

const findSlots = [EquipmentSlot.Mainhand, EquipmentSlot.Offhand, EquipmentSlot.Head];

const mutekiAbilities = [
    {
        typeId: `minecraft:fire_resistance`,
        amplifier: 2
    },
    {
        typeId: `minecraft:strength`,
        amplifier: 2
    },
    {
        typeId: `minecraft:speed`,
        amplifier: 15
    },
    {
        typeId: `minecraft:jump_boost`,
        amplifier: 5
    },
    {
        typeId: `minecraft:night_vision`,
        amplifier: 0,
        duration: 205
    },
    {
        typeId: `minecraft:water_breathing`,
        amplifier: 0,
    },
    {
        typeId: `minecraft:saturation`,
        amplifier: 0,
    },
    {
        typeId: `minecraft:haste`,
        amplifier: 2,
    },
    {
        typeId: `minecraft:village_hero`,
        amplifier: 100,
    }
];

/**
 * 
 * @param { EntityEquippableComponent } equippableComponent 
 * @returns { Boolean }
 */
function findMutekiCatalyst(equippableComponent) {
    return findSlots.some(slot => equippableComponent.getEquipment(slot)?.typeId === mutekiCatalyst);
};

system.runTimeout(() => {
    system.sendScriptEvent(`mutekiaddon:system`, `muteki`);
}, 20);

world.beforeEvents.entityHurt.subscribe(ev => {

    const { hurtEntity } = ev;

    if (!(hurtEntity instanceof Player)) return;

    const equippableComponent = hurtEntity.getComponent(EntityComponentTypes.Equippable);
    if (!equippableComponent) return;

    const hasMutekiCatalyst = findMutekiCatalyst(equippableComponent);
    if (!hasMutekiCatalyst) return;

    ev.cancel = true;

});

world.afterEvents.playerSwingStart.subscribe(ev => {
    const { player } = ev;
    const healthComponent = player.getComponent(EntityComponentTypes.Health);
    if (!healthComponent) return;
    healthComponent.resetToMinValue();
});

system.afterEvents.scriptEventReceive.subscribe(ev => {

    const { id, message } = ev;

    if (id === `mutekiaddon:system` && message === `muteki`) {

        system.runInterval(() => {

            const players = world.getAllPlayers();

            for (const player of players) {

                const equippableComponent = player.getComponent(EntityComponentTypes.Equippable);
                if (!equippableComponent) continue;

                const hasMutekiCatalyst = findMutekiCatalyst(equippableComponent);
                if (!hasMutekiCatalyst) continue;

                mutekiAbilities.forEach(mutekiAbility => {
                    player.addEffect(mutekiAbility.typeId, mutekiAbility.duration ? mutekiAbility.duration : 5, { amplifier: mutekiAbility.amplifier, showParticles: false });
                });

                const healthComponent = player.getComponent(EntityComponentTypes.Health);
                if (!healthComponent) continue;

                system.runTimeout(() => {
                    healthComponent.resetToMaxValue();
                }, 0.99);

            };

        });

    };

});