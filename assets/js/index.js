// @ts-nocheck
import {getLocalStorageItem,setLocalStorageItem} from "./helper.js";

const getAllShow_url = 'https://api.tvmaze.com/shows';
const baseUrl = 'https://api.tvmaze.com/search/shows';
const getAllByPage_url = 'https://api.tvmaze.com/shows?page=';
const maxShowList = 10;
const input = document.getElementById('search');
const listShow = document.getElementById('listShow');
const recentRequest = document.getElementById('recentRequest');
const imgShow = document.getElementById('imgShow');
const arrRecentRequest = [];

const clearListChild = (list)=>
{
    if(list)
        list.innerHTML = '';
}

const createList = (textContent,...claslist) =>
{
    const li = document.createElement('li');
    for (let i = 0; i< claslist.length;i++)
    {
        li.classList.add(claslist[i]);
    }
    li.textContent = textContent;
    return li;
}

const addedRecentShow = (arrRecentShow) =>
{
    try 
    {
        recentRequest.innerHTML = '';
        for(let i = arrRecentShow.length-1; i >=0; i--)
        {
            const li = createList(arrRecentRequest[i],'list-group-item','mylist');
            recentRequest?.appendChild(li); 
        }
    } catch (error) 
    {
        console.error(error);
        throw new Error('Error with set recent list');    
    }
} 

const updateArrRecentRequset = (content, countRecent = 3)=>
{
    if(arrRecentRequest.length < countRecent)
    {
        arrRecentRequest.push(content);
    }else
    {
        for (let i = 1; i < arrRecentRequest.length; i++)
        {
            arrRecentRequest[i-1] = arrRecentRequest[i];
        }
        arrRecentRequest[arrRecentRequest.length-1] = content;
    }
    
    addedRecentShow(arrRecentRequest);
}
const isRepeat = (content,arr) =>
{
    for(let i of arr)
    {
        if(i.name && i.name === content)
        {
            return true;
        }
    }
    return false;
}
const recordToLocalStorage = (content) =>
{
    try 
    {
        console.log('recordToLocalStorage');
        const show = {date:Date.now(), name:content}; 
        const arr = getLocalStorageItem("shows");
        if(arr)
        {
            if(isRepeat(content,arr) === false)
            {
                arr.push(show);
                if (arr.length > maxShowList)
                {
                    arr.shift();
                }
                const json = JSON.stringify(arr);
                setLocalStorageItem("shows",json);
            }
        }else
        {
            const json = '[' + JSON.stringify(show) + ']';
            setLocalStorageItem("shows",json);
        }
        updateArrRecentRequset(content);
    
    } catch (error) 
    {

        console.error(error);
        throw new Error('Error with record to local storage'); 
    }
}

const getNameShowsFromLocalStorage = (word = '',countGetData = 5) =>
{
    const data = [];
    try 
    { 
        const arr = getLocalStorageItem("shows");
        if(arr)
        {
            if(word && word!== '')
            {
                let c = 0;
                for(let i = 0; i< arr.length;i++)
                {
                    let name = arr[i].name.toLowerCase();
                    word = word.toLowerCase();
                    if(name.search(word) !== -1)
                    {
                        c++;
                        data.push(arr[i].name);
                    }
                    if(c >= countGetData)
                        return data;
                }
            }else
            {
                const end = arr.length - countGetData < 0 ? 0 : arr.length - countGetData;
                for(let i=arr.length-1; i>=end ;i--)
                {
                    if(arr[i].name)
                        data.push(arr[i].name);
                }
            }
        }
   
        return data;
    } catch (error) 
    {
        console.error(error);
        throw new Error('Error with get data from localstorage');    
    }
    finally
    {
        return data;
    }
}

const getRandomIntegerBeetwenMinMax = (min,max) =>
{
    return Math.floor(Math.random() * (max - min) + min);
}

const getNameShowsFromGotData = (data,start,end) =>
{
    const newData = [];

    for (let i =start;i < end && i<data.length;i++)
    {
        const elem = data[i];
        const textContent = elem.show ? elem.show.name : elem.name;
        newData.push(textContent);
    }

    return newData;
}

const fillHtmlElementUl = (parent,data,...classlist) =>
{
    for (let i = 0; i< data.length;i++)
    {
        const li = createList(data[i],...classlist);
        parent?.appendChild(li);
    }
}

const fillListShows = (data,req = null) =>
{
    let ind = 0;
    let end = maxShowList;
    if (data.length > maxShowList && req === null)
    {
        const len = data.length - maxShowList - 1;
        ind = getRandomIntegerBeetwenMinMax(0,len);
        end = ind + maxShowList;
    }
    const nameShowsFromlocalStorage = getNameShowsFromLocalStorage(req);
    
    end = end - nameShowsFromlocalStorage.length; 
    const nameShowsFromInternal = getNameShowsFromGotData(data,ind,end);

    fillHtmlElementUl(listShow,nameShowsFromlocalStorage,'list-group-item','mylist','recentElem');
    fillHtmlElementUl(listShow,nameShowsFromInternal,'list-group-item','mylist');
}
const getShows = (params={},embeded = '', page = 1) =>
{
    let url = getAllByPage_url + page;
    if (params.q && params.q !== '')
    {
        url = baseUrl + `?q=${params.q}`;
    }
    fetch(url,
    {
        method:'GET'
    })
    .then((response) =>
    {
        if(response.ok === false)
        {
            return response.text().then(text => { throw new Error(text)});
        }
        return response.json();
    })
    .then(data => 
    {
        const req = params.q && params.q !== '' ? params.q : null;
        fillListShows(data,req);
    })
    .catch((error) =>
    {
        console.error(error);
        console.log('Error from server');
    });
}

     
const decorator_input = _.debounce((event)=>
{
    console.log('Input');
    clearListChild(listShow);
    const text = event.target.value;
    
    if(text && text !== '')
    {
        getShows({q:text}); 
    }else
        getShows();
},1000);

if(input)
{
    input.addEventListener('input',async (event)=>
    {
        await decorator_input(event);
    });

    input.addEventListener('focus',(e)=>
    {
        console.log('focues');
        // @ts-ignore
        if(input && input.value === '') 
        {
            clearListChild(listShow);
            getShows();
        }

    });

}

const showImgShow = (content) =>
{
    fetch(baseUrl + '?q=' + content)
    .then((response) =>
    {
        if(response.ok === false)
        {
            throw new Error('Error from server');
        }
        return response.json();
    })    
    .then(data => 
    {
        console.log(data);
        if(data && data.length !==0)
        {
            if(data[0].show.image.medium)
            {
                imgShow.src = data[0].show.image.medium;
            }else
            {
                imgShow.src = data[0].image.medium;
            }
        }
            
    })
    .catch(error => 
    {
        console.error(error);
        throw new Error('Error with get data by content'); 
    });
}

document.addEventListener('click',(e) =>
{
    try
    {
        if(e.target)
        {
            if(e.target.parentNode && e.target.parentNode.id === 'listShow')
            {
                const content = e.target.textContent;
                clearListChild(listShow);
                recordToLocalStorage(content);
                showImgShow(content);
                input.value = '';
            }else if(e.target.parentNode && e.target.parentNode.id !== 'listShow' && e.target.id !== 'search' && e.target.parentNode.id !== 'recentRequest')
            {
                clearListChild(listShow);
            }
            
            
        }
    }
    catch(error)
    {
        console.error(error);
        throw new Error('Error with read click mouse');
    }
});

const updateRecentAfterLoadedDoomOrChangeStorage = () =>
{
    if(recentRequest)
    {
        let data = getNameShowsFromLocalStorage('',3);
        for(let i =data.length-1;i>=0; i--)
            updateArrRecentRequset(data[i]);
    }
}

const createSpan = (letter,color) =>
{
    const span = document.createElement('span');
    span.textContent = letter;
    span.style.color = color;
    return span;
}
const createBeautifulWord = (str) =>
{
    const title = document.getElementById('beautifullView');
    const colors = ['red','purple','','red','blue','red','purple','#CB401B','blue','#30360F','red','','#EBD3B7','#D04861'];
    for(let i =0;i<str.length;i++)
    {
        title.appendChild(createSpan(str[i],colors[i]));
    }
}
document.addEventListener('DOMContentLoaded',() =>
{
    console.log('DOM loaded');

    if(recentRequest)
    {
        updateRecentAfterLoadedDoomOrChangeStorage();
    }

    const title = document.getElementById('beautifullView');
    title.appendChild(createSpan('I','red'));
    title.appendChild(createSpan('t','purple'));
    title.appendChild(createSpan(' ',''));
    title.appendChild(createSpan('is','red'));
    title.appendChild(createSpan(' ',''));
    title.appendChild(createSpan('a','blue'));
    title.appendChild(createSpan('m','red'));
    title.appendChild(createSpan('a','purple'));
    title.appendChild(createSpan('z','#CB401B'));
    title.appendChild(createSpan('i','blue'));
    title.appendChild(createSpan('n','#30360F'));
    title.appendChild(createSpan('g','red'));
    title.appendChild(createSpan(' ',''));
    title.appendChild(createSpan('Sho','#EBD3B7'));
    title.appendChild(createSpan('ws','#D04861'));
    
});

window.addEventListener('storage',() =>
{
    console.log(localStorage);
    recentRequest.innerHTML = '';
    updateRecentAfterLoadedDoomOrChangeStorage();
});


//--------------------------------------------- Animation Snow
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

let width, height, lastNow;
let snowflakes;
const maxSnowflakes = 100;
let delay = 0;
const duration = 10;
const time = new Date().getTime();
const colors = ['red','blue','white'];

function randomColorSnow(t)
{
    if (t < delay)
        return 0;

    delay += duration;
    let r = Math.floor(rand(1,15));
    if (r > 10)
        ctx.fillStyle = ctx.strokeStyle = colors[0];
    else if(r > 5)
        ctx.fillStyle = ctx.strokeStyle = colors[1];
    else
        ctx.fillStyle = ctx.strokeStyle = colors[2];
}
function init() 
{
  snowflakes = []
  resize()
  render(lastNow = performance.now())
}

function render(now) 
{
    requestAnimationFrame(render)
    
    const elapsed = now - lastNow
    lastNow = now
    
    ctx.clearRect(0, 0, width, height)
    if (snowflakes.length < maxSnowflakes)
        snowflakes.push(new Snowflake());

    let t = (new Date().getTime() - time) / 1000;
    randomColorSnow(t);
   // console.log(Math.ceil(t));
    snowflakes.forEach(snowflake => snowflake.update(elapsed, now))
}

function pause() {
  cancelAnimationFrame(render)
}
function resume() {
  lastNow = performance.now()
  requestAnimationFrame(render)
}


class Snowflake 
{
  constructor() 
  {
    this.spawn()
  }
  
  spawn(anyY = false) 
  {
    this.x = rand(0, width)
    this.y = anyY === true
      ? rand(-50, height + 50)
      : rand(-50, -10)
    this.xVel = rand(-.05, .05)
    this.yVel = rand(.02, .1)
    this.angle = rand(0, Math.PI * 2)
    this.angleVel = rand(-.001, .001)
    this.size = rand(7, 12)
    this.sizeOsc = rand(.01, .5)
  }
  
  update(elapsed, now) 
  {
    const xForce = rand(-.001, .001);

    if (Math.abs(this.xVel + xForce) < .075)
    {
      this.xVel += xForce
    }
    
    this.x += this.xVel * elapsed
    this.y += this.yVel * elapsed
    this.angle += this.xVel * 0.05 * elapsed //this.angleVel * elapsed
    
    if (
      this.y - this.size > height ||
      this.x + this.size < 0 ||
      this.x - this.size > width
    ) {
      this.spawn()
    }
    
    this.render()
  }
  
  render() 
  {
    ctx.save()
    const { x, y, angle, size } = this
    ctx.beginPath()
    ctx.arc(x, y, size * 0.2, 0, Math.PI * 2, false)
    ctx.fill()
    ctx.restore()
  }
}

// Utils
const rand = (min, max) => min + Math.random() * (max - min)

function resize() {
  width = canvas.width = window.innerWidth
  height = canvas.height = window.innerHeight
}

window.addEventListener('resize', resize)
window.addEventListener('blur', pause)
window.addEventListener('focus', resume)
init()