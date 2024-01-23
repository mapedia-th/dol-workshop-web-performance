
// Check if the current URL is login.html
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.href.endsWith('login.html')) {
    // Clear localStorage
    localStorage.clear();
  } else if (window.location.href.endsWith('index.html') || window.location.href.endsWith('/') || window.location.href.endsWith('/home.html')) {

    if (!localStorage.getItem('user_data')) {
      window.location.href = "login.html";
    } else {

      const userSpan = document.getElementById('userSpan');
      const userFullName = document.getElementById('userFullName');
      const userRole = document.getElementById('userRole');

      const user = JSON.parse(localStorage.getItem('user_data'));
      // Check if the user exists and has not been redirected
      if (user && user.role !== 'superadmin' && !localStorage.getItem('redirected')) {
        // Set a flag to indicate that redirection has been done
        localStorage.setItem('redirected', 'true');

        // Redirect to index.html
        window.location.href = 'index.html';
      }
      // if (user.role != 'superadmin') {
      //   window.location.href = "/"
      // }

      userSpan.textContent = `${user.first_name} ${user.last_name}`;
      // Remove the 'd-none' class to make it visible
      userSpan.classList.remove('d-none');
      userFullName.textContent = `${user.first_name} ${user.last_name}`;
      userRole.textContent = user.role;
    }

    // Fetch data from the API endpoint
    fetch('http://localhost:3000/allmember')
      .then(response => response.json())
      .then(data => {
        console.log(data);
        // Check if data is not empty
        if (data && data.length > 0) {
          // Call function to render data in HTML table
          renderTable(data);
        } else {
          // Handle case where no members are found
          console.log('No members found.');
        }
      })
      .catch(error => console.error('Error:', error));
  }
});

function attemptLogin() {
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;
  // Check if the username and password are valid (for demonstration purposes)
  if (username != null && username != undefined && password != null && password != undefined) {
    loginUser(username, password);
  } else {
    alert('กรุณากรอกข้อมูลให้ครบ')
  }
}

function logout() {
  localStorage.clear();
  Swal.fire({
    title: 'ออกจากระบบเรียบร้อยแล้ว',
    icon: 'success',
    timer: 1500,
    showConfirmButton: false
  })
  setTimeout(() => {
    window.location.href = "login.html"
  }, 2000);
}

function registerMember() {
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;
  var email = document.getElementById("email").value;
  var first_name = document.getElementById("first_name").value;
  var last_name = document.getElementById("last_name").value;

  memberData = {
    username: username,
    email: email,
    password: password,
    first_name: first_name,
    last_name: last_name,
    role: 'user',
  }
  if (memberData.username != undefined && memberData.email != undefined && memberData.password != undefined && memberData.first_name != undefined && memberData.last_name != undefined) {
    addMember(memberData)
      .then((response) => {
        alert(response.message)
        window.location.href = "login.html";
      })
      .catch((error) => {
        alert('ขออภัยไม่สามารถเพิ่มผู้ใช้งานใหม่ได้')
      });
  } else {
    alert('กรุณากรอกข้อมูลให้ครบทุกช่อง')
  }
}

async function addMember(memberData) {
  const apiUrl = 'http://localhost:3000/register'; // Replace with your actual API endpoint

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // You may need to include additional headers like authorization if required
      },
      body: JSON.stringify(memberData),
    });

    if (!response.ok) {
      // Handle error responses
      const errorMessage = await response.text();
      throw new Error(`Failed to register member: ${errorMessage}`);
    }

    // Registration successful
    const responseData = await response.json();
    console.log('Member registered successfully:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error during member registration:', error.message);
    throw error;
  }
}

async function loginUser(username, password) {
  const apiUrl = 'http://localhost:3000/login'; // Replace with your actual API endpoint

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // You may need to include additional headers like authorization if required
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      // Handle error responses
      const errorMessage = await response.text();
      Swal.fire({
        title: 'ไม่สามารถเข้าสู้ระบบได้',
        icon: 'error',
        timer: 1500,
        showConfirmButton: false
      })
      throw new Error(`Failed to login: ${errorMessage}`);
    }

    // Login successful
    
    Swal.fire({
      title: 'ลงชื่อเข้าใช้งานสำเร็จ',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    })

    const responseData = await response.json();    
    localStorage.setItem('user_data', JSON.stringify(responseData))
    setTimeout(()=>{
      window.location.href = "index.html";
    },2000)
    return responseData;
  } catch (error) {
    console.error('Error during login:', error.message);
    throw error;
  }
}

function renderTable(data) {
  // Get table body element
  const tableBody = document.querySelector('#membersTable tbody');

  // Iterate through each member and create a table row
  data.forEach(member => {
    const row = tableBody.insertRow();
    const cell1 = row.insertCell(0);
    const cell2 = row.insertCell(1);
    const cell3 = row.insertCell(2);
    const cell4 = row.insertCell(3);
    const cell5 = row.insertCell(4);

    // Fill the cells with member data
    cell1.textContent = member.first_name;
    cell2.textContent = member.last_name;
    cell3.textContent = member.email;
    cell4.textContent = member.role;
    // Create a button for removal
    const removeButton = document.createElement('button');
    removeButton.textContent = 'ลบข้อมูล';
    // Add classes to the button
    removeButton.classList.add('btn', 'btn-danger');
    removeButton.addEventListener('click', () => handleRemoveClick(member.id)); // Assuming you have an 'id' property in your member data


    // Append the button to the cell
    cell5.appendChild(removeButton);
  });
}

function handleRemoveClick(memberId) {
  // Implement the logic to handle the removal of the member with the specified memberId
  // You can make another API request to handle the removal on the server side
  // After removal, you may want to update the table or take other actions
  console.log('Remove button clicked for member with ID:', memberId);
}


// (function () {

//   const select = (el, all = false) => {
//     el = el.trim()
//     if (all) {
//       return [...document.querySelectorAll(el)]
//     } else {
//       return document.querySelector(el)
//     }
//   }

//   const on = (type, el, listener, all = false) => {
//     if (all) {
//       select(el, all).forEach(e => e.addEventListener(type, listener))
//     } else {
//       select(el, all).addEventListener(type, listener)
//     }
//   }

//   if (select('.toggle-sidebar-btn')) {
//     on('click', '.toggle-sidebar-btn', function (e) {
//       select('body').classList.toggle('toggle-sidebar')
//     })
//   }

//   const mainContainer = select('#main');
//   if (mainContainer) {
//     setTimeout(() => {
//       new ResizeObserver(function () {
//         select('.echart', true).forEach(getEchart => {
//           echarts.getInstanceByDom(getEchart).resize();
//         })
//       }).observe(mainContainer);
//     }, 200);
//   }
// })();


