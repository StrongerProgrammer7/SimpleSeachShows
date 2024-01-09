// @ts-nocheck

export const getLocalStorageItem = (key) =>
{
    if(window.localStorage && window.localStorage.getItem(key))
    {
        const elem = window.localStorage.getItem(key);
        try 
        {
            const arr = JSON.parse(elem); 
            return arr;   
        } catch (error) 
        {
            console.log("Error with JSON parse from localStorage");
            console.error(error);
        }
    }
}

export const setLocalStorageItem =(key,value) =>
{
    try
    {
        localStorage.setItem(key,value);
    }
    catch(error)
    {
        console.log("Error with set to local storage key:" , key, " value:",value);
        console.error(error);
    }
}