// client/src/utils/vehicleImages.js

const imageMap = {
    //Bikes Images
    'Royal Enfield Bullet':'/images/vehicles/Royal Enfield Bullet.webp',
    'Royal Enfield Interceptor':'/images/vehicles/Royal Enfield Interceptor.webp',
    'Royal Enfield Himalayan':'/images/vehicles/Royal Enfield Himalayan.avif',
    'Bajaj Pulsar':'/images/vehicles/Bajaj Pulsar.avif',
    'Bajaj Dominar':'/images/vehicles/Bajaj Dominar.avif',
    'Honda Shine':'/images/vehicles/Honda Shine.avif',
    'Bajaj Platina':'/images/vehicles/Bajaj Platina.avif',
    'Hero Passion':'/images/vehicles/Hero Passion.webp',
    'Honda Hornet':'/images/vehicles/Honda Hornet.avif',
    
    //car Images
    'Maruti Suzuki Baleno' : '/images/vehicles/Maruti Suzuki Baleno.jpg',
    'Maruti Suzuki Dzire':'/images/vehicles/Maruti Suzuki Dzire.jpg',
    'Maruti Suzuki Swift':'/images/vehicles/Maruti Suzuki Swift.jpg',
    'Maruti Suzuki Ertiga':'/images/vehicles/Maruti Suzuki Ertiga.jpg',
    'Hyundai i20':'/images/vehicles/Hyundai i20.jpg',
    'Toyota Fortuner':'/images/vehicles/Toyota Fortuner.jpg',
    'Honda CR-V':'/images/vehicles/Honda CR-V.webp',
    'Hyundai i10':'/images/vehicles/Hyundai i10.avif',
    'Hyundai Creta':'/images/vehicles/Hyundai Creta.avif',
    'Honda City':'/images/vehicles/Honda City.jpeg',
    'Honda Civic':'/images/vehicles/Honda Civic.webp',


    'Hero Glamour':'/images/vehicles/Hero Glamour.png',
    'Toyota Camry': '/images/vehicles/Toyota Camry.png',
    'Toyota Corolla': '/images/vehicles/Toyota_Corolla.svg',
    'Toyota Innova': '/images/vehicles/wp3119881.jpg',
    // 'Mahindra Thar': '/images/vehicles/thar.jpg',
};

const brandDefaults = {
    'Toyota': '/images/vehicles/Toyota.svg',
    'Mahindra': '/images/desktop-wallpaper-mahindra-thar-thar-car.jpg',
}

export const getVehicleImage = (brand, model) => {
    const key = `${brand} ${model}`;
    if (imageMap[key]) {
        return imageMap[key];
    }
    if (brandDefaults[brand]) {
        return brandDefaults[brand];
    }
    return '/placeholder-vehicle.jpg'; // A generic placeholder
};
