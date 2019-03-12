/* @flow */

import { getClientID } from '@paypal/sdk-client/src';

type TrackingType = 'view' | 'cartEvent' | 'purchase';

type CartEventType = 'addToCart' | 'setCart' | 'removeFromCart';

type Product = {|
    id : string,
    sku? : string,
    name? : string,
    url? : string,
    description? : string,
    imgUrl? : string,
    otherImages? : $ReadOnlyArray<string>
|};

type Cart = {|
    cartId? : string,
    items : $ReadOnlyArray<Product>,
    emailCampaignId? : string,
    price? : number,
    currencyCode? : string,
    keywords? : $ReadOnlyArray<string>
|};

type RemoveCart = {|
    cartId? : string,
    items : $ReadOnlyArray<{ id : string }>
|};

const user = { id: undefined, name: undefined };

const track = <T>(trackingType : TrackingType, trackingData : T) : Promise<void> => {
    const encodeData = data => encodeURIComponent(btoa(JSON.stringify(data)));

    return new Promise((resolve, reject) => {
        const img = document.createElement('img');
        img.style.display = 'none';
        img.src = `https://api.keen.io/3.0/projects/5b903f6ec9e77c00013bc6a7/events/${ trackingType }?api_key=700B56FBE7A2A6BD845B82F9014ED6628943091AD5B0A5751C3027CFE8C5555448C6E11302BD769FCC5BDD003C3DE8282C4FC8FE279A0AAC866F2C97010468197B98779B872EFD7EE980D2986503B843DA3797C750DAA00017DC8186078EADA6&data=${ encodeData(
            {
                ...trackingData,
                userId:   user.id,
                userName: user.name,
                clientId: getClientID()
            }
        ) }`;
        img.addEventListener('load', () => resolve());
        img.addEventListener('error', reject);
        if (document.body) {
            document.body.appendChild(img);
        }
    });
};

const trackCartEvent = <T>(cartEventType : CartEventType, trackingData : T) : Promise<void> =>
    track('cartEvent', { ...trackingData, cartEventType });

export const Tracker = {
    setUser: (data : { user : { id : string, name : string } }) => {
        user.id = data.user.id;
        user.name = data.user.name;
    },
    view:           (data : { pageUrl : string }) => track('view', data),
    addToCart:      (data : Cart) => trackCartEvent('addToCart', data),
    setCart:        (data : Cart) => trackCartEvent('setCart', data),
    removeFromCart: (data : RemoveCart) => trackCartEvent('removeFromCart', data),
    purchase:       (data : { cartId : string }) => track('purchase', data)
};
