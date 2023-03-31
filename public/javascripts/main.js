const menuItemsText = document.querySelectorAll('.mOptionText')

document.querySelector('#menuText').addEventListener('mouseover', function(){
    document.querySelector('#menuOptions').style.display = 'block';
})

document.querySelector('#menuOptions').addEventListener('mouseleave', function(){
    document.querySelector('#menuOptions').style.display = 'none';
})

menuItemsText.forEach(item => item.addEventListener('mouseover', function(){
    item.style.backgroundColor = '#43505D';
    item.style.color = '#FFFFFF';
}))

menuItemsText.forEach(item => item.addEventListener('mouseleave', function(){
    item.style.backgroundColor = 'rgb(166, 204, 255)';
    item.style.color = '#43505D';
}))