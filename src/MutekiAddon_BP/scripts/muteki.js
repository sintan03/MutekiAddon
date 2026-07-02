// @ts-check

import { world, system, EntityComponentTypes, EquipmentSlot, EntityEquippableComponent, Player } from "@minecraft/server";

const findSlots = [EquipmentSlot.Mainhand, EquipmentSlot.Offhand, EquipmentSlot.Head];

/**
 * 
 * @param { EntityEquippableComponent } equippableComponent 
 * @returns { Boolean }
 */
function findMutekiCatalyst(equippableComponent) {
    return findSlots.some(slot => equippableComponent.getEquipment(slot)?.typeId === `mutekiaddon:muteki_catalyst`);
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
    ev.damage = 0;

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
                if (hasMutekiCatalyst) continue;

                const healthComponent = player.getComponent(EntityComponentTypes.Health);
                if (!healthComponent) continue;

                system.runTimeout(() => {
                    healthComponent.resetToMaxValue();
                }, 0.99999999);

            };

        }, 0);

    };

});