// This file is executed in the browser, when people visit /chat/<random id>

$(function(){
  // getting the id of the room from the url
  var id = Number(window.location.pathname.match(/\/chat\/(\d+)$/)[1]);

  // connect to the socket
  var socket = io.connect('/socket');

  // variables which hold the data for each person
  var name = "",
    email = "",
    img = "",
    friend = "";

  // cache some jQuery objects
  var section = $(".section"),
    footer = $("footer"),
    onConnect = $(".connected"),
    inviteSomebody = $(".invite-textfield"),
    personInside = $(".personinside"),
    chatScreen = $(".chatscreen"),
    left = $(".left"),
    noMessages = $(".nomessages");

  // some more jquery objects
  var chatNickname = $(".nickname-chat"),
    leftNickname = $(".nickname-left"),
    loginForm = $(".loginForm"),
    yourName = $("#yourName"),
    yourEmail = $("#yourEmail"),
    hisName = $("#hisName"),
    hisEmail = $("#hisEmail"),
    chatForm = $("#chatform"),
    textarea = $("#message"),
    messageTimeSent = $(".timesent"),
    chats = $(".chats");

  // these variables hold images
  var noMessagesImage = $("#noMessagesImage");


  // on connection to server get the id of person's room
  socket.on('connect', function(){
    socket.emit('load', id);
  });

  // receive the names of all people in the chat room
  socket.on('peopleinchat', function(data){
    if(data.number === 0){
      showMessage("connected");
      loginForm.on('submit', function(e){
        e.preventDefault();
        name = $.trim(yourName.val());        
        if(name.length < 1){
          alert("Please enter a nick name longer than 1 character!");
          return;
        }
        // email = yourEmail.val();
        // if(!isValid(email)) {
        //   alert("Please enter a valid email!");
        // }
        // else {
          showMessage("inviteSomebody");
        //   // call the server-side function 'login' and send users' parameters
          socket.emit('login', {user: name, id: id});
        // }     
      });
    }

    else if(data.number >= 1) {
      showMessage("personinchat",data);
      loginForm.on('submit', function(e){
        e.preventDefault();
        name = $.trim(hisName.val());
        if(name.length < 1){
          alert("Please enter a nick name longer than 1 character!");
          return;
        }
        if(name == data.user){
          alert("There already is a \"" + name + "\" in this room!");
          return;
        }
        email = hisEmail.val();
        if(!isValid(email)){
          alert("Wrong e-mail format!");
        }
        else{
          socket.emit('login', {user: name, id: id});
        }
      });
    }
  });

  // Other useful 

  socket.on('startChat', function(data){
    if(data.boolean && data.id == id) {
      chats.empty();
      if(name === data.users[0]) {
        showMessage("youStartedChatWithNoMessages",data);
      }
      else {
        showMessage("heStartedChatWithNoMessages",data);
      }
      chatNickname.text(friend);
    }
  });

  socket.on('leave',function(data){
    if(data.boolean && id==data.room){
      showMessage("somebodyLeft", data);
      chats.empty();
    }
  });

  socket.on('receive', function(data){
      showMessage('chatStarted');
      createChatMessage(data.msg, data.user, moment());
      scrollToBottom();
  });

  // Submit the form on enter
  textarea.keypress(function(e){
    if(e.which == 13) {
      e.preventDefault();
      chatForm.trigger('submit');
    }
  });

  chatForm.on('submit', function(e){
    e.preventDefault();
    // Create a new chat message and display it directly
    showMessage("chatStarted");
    createChatMessage(textarea.val(), name, moment());
    scrollToBottom();
    // Send the message to the other person in the chat
    socket.emit('msg', {msg: textarea.val(), user: name, img: img});
    // Empty the textarea
    textarea.val("");
  });

  // Update the relative time stamps on the chat messages every minute

  setInterval(function(){
    messageTimeSent.each(function(){
      var each = moment($(this).data('time'));
      $(this).text(each.fromNow());
    });
  },60000);

  // Function that creates a new chat message

  function createChatMessage(msg,user,now){
    var li = $(
      '<li class=' + (user===name ? 'me' : 'you') + '>'+
        '<div class="image">' +
          '<i class="timesent" data-time=' + now + '></i> ' +
        '</div>' +
        '<p></p>' +
      '</li>');

    // use the 'text' method to escape malicious user input
    li.find('p').text(msg);
    li.find('b').text(user);

    chats.append(li);

    messageTimeSent = $(".timesent");
    messageTimeSent.last().text(now.fromNow());
  }

  function scrollToBottom(){
    $("html, body").animate({ scrollTop: $(document).height()-$(window).height() },1000);
  }

  function isValid(thatemail) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(thatemail);
  }

  function showMessage(status,data){
    if(status === "connected"){
      section.children().css('display', 'none');
      onConnect.fadeIn(1200);
    }
    else if(status === "inviteSomebody"){
      // Set the invite link content
      $("#link").text(window.location.href);

      onConnect.fadeOut(1200, function(){
        inviteSomebody.fadeIn(1200);
      });
    }

    else if(status === "personinchat"){
      onConnect.css("display", "none");
      personInside.fadeIn(1200);

      chatNickname.text(data.user);
    }

    else if(status === "youStartedChatWithNoMessages") {
      left.fadeOut(1200, function() {
        inviteSomebody.fadeOut(1200,function(){
          noMessages.fadeIn(1200);
          footer.fadeIn(1200);
        });
      });

      friend = data.users[1];
      noMessagesImage.attr("src","http://www.toonpool.com/user/3257/files/stupid_391615.jpg");
    }

    else if(status === "heStartedChatWithNoMessages") {
      personInside.fadeOut(1200,function(){
        noMessages.fadeIn(1200);
        footer.fadeIn(1200);
      });

      friend = data.users[0];
      noMessagesImage.attr("src","http://www.toonpool.com/user/3257/files/stupid_391615.jpg");
    }

    else if(status === "chatStarted"){
      section.children().css('display','none');
      chatScreen.css('display','block');
    }

    else if(status === "somebodyLeft"){
      leftNickname.text(data.user);

      section.children().css('display','none');
      footer.css('display', 'none');
      left.fadeIn(1200);
    }
  }
});