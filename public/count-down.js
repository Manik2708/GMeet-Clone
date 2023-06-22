const countDisplay=document.querySelector('.counts h5');
function countDown(count){
    countDisplay.innerHTML=count;
}

let cnt=59;
let counting=setInterval(()=>{
    countDown(cnt);
    if(cnt==0){
        clearInterval(counting);
    console.log('counting finished !');
    }
    cnt--;
},1000);