document.addEventListener('DOMContentLoaded', function() {
    // Initialize farmers array from local storage or empty array
    let farmers = JSON.parse(localStorage.getItem('nattuSakkaraiFarmers')) || [];
    
    // Form submission for farmer registration
    const farmerForm = document.getElementById('farmerForm');
    farmerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const farmerName = document.getElementById('farmerName').value;
        const govtId = document.getElementById('govtId').value;
        const phone = document.getElementById('phone').value;
        const district = document.getElementById('district').value;
        const sakkaraiKg = document.getElementById('sakkaraiKg').value;
        const price = document.getElementById('price').value;
        
        // Create farmer object
        const farmer = {
            id: Date.now(), // Simple unique ID
            name: farmerName,
            govtId: govtId,
            phone: phone,
            district: district,
            sakkaraiKg: sakkaraiKg,
            price: price,
            available: sakkaraiKg, // Initially all is available
            date: new Date().toISOString() // Add registration date
        };
        
        // Add to farmers array
        farmers.push(farmer);
        
        // Save to local storage
        saveFarmersToLocalStorage();
        
        // Update the table
        updateFarmersTable();
        
        // Reset form
        farmerForm.reset();
        
        // Show success message
        alert('பதிவு வெற்றிகரமாக செய்யப்பட்டது!\nRegistration successful!');
    });
    
    // Function to save farmers data to local storage
    function saveFarmersToLocalStorage() {
        localStorage.setItem('nattuSakkaraiFarmers', JSON.stringify(farmers));
    }
    
    // Function to update farmers table
    function updateFarmersTable() {
        const tableBody = document.querySelector('#farmersTable tbody');
        tableBody.innerHTML = '';
        
        // Sort by most recent first
        const sortedFarmers = [...farmers].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        sortedFarmers.forEach(farmer => {
            if (parseInt(farmer.available) > 0) {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${farmer.name}<br><small>${formatDate(farmer.date)}</small></td>
                    <td>${farmer.district}<br><small>${farmer.phone}</small></td>
                    <td>${farmer.available} kg<br><small>Total: ${farmer.sakkaraiKg} kg</small></td>
                    <td>₹${farmer.price}/kg<br><small>Total: ₹${farmer.price * farmer.available}</small></td>
                    <td><span class="table-action" data-id="${farmer.id}">வாங்குக / Purchase</span></td>
                `;
                
                tableBody.appendChild(row);
            }
        });
        
        // Add event listeners to purchase buttons
        document.querySelectorAll('.table-action').forEach(button => {
            button.addEventListener('click', function() {
                const farmerId = parseInt(this.getAttribute('data-id'));
                openPurchaseModal(farmerId);
            });
        });
    }
    
    // Helper function to format date
    function formatDate(dateString) {
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('ta-IN', options);
    }
    
    // Function to open purchase modal
    function openPurchaseModal(farmerId) {
        const farmer = farmers.find(f => f.id === farmerId);
        if (farmer) {
            document.getElementById('purchaseFarmerId').value = farmerId;
            document.getElementById('purchaseQty').max = farmer.available;
            document.getElementById('purchaseQty').placeholder = `Max: ${farmer.available} kg`;
            
            // Initialize modal
            const modal = new bootstrap.Modal(document.getElementById('purchaseModal'));
            modal.show();
        }
    }
    
    // Form submission for purchase
    const purchaseForm = document.getElementById('purchaseForm');
    purchaseForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const farmerId = parseInt(document.getElementById('purchaseFarmerId').value);
        const qty = parseInt(document.getElementById('purchaseQty').value);
        const buyerName = document.getElementById('buyerName').value;
        const buyerDept = document.getElementById('buyerDept').value;
        const buyerId = document.getElementById('buyerId').value;
        
        // Find the farmer
        const farmerIndex = farmers.findIndex(f => f.id === farmerId);
        if (farmerIndex !== -1) {
            const farmer = farmers[farmerIndex];
            
            // Check if quantity is available
            if (qty > parseInt(farmer.available)) {
                alert(`மிகுதியான அளவு! கிடைக்கும் அளவு: ${farmer.available} kg\nExcess quantity! Available: ${farmer.available} kg`);
                return;
            }
            
            // Update available quantity
            farmers[farmerIndex].available = parseInt(farmer.available) - qty;
            
            // Save to local storage
            saveFarmersToLocalStorage();
            
            // Update table
            updateFarmersTable();
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('purchaseModal'));
            modal.hide();
            
            // Reset form
            purchaseForm.reset();
            
            // Show success message with receipt
            const totalAmount = qty * farmer.price;
            const receipt = `
                வாங்குதல் வெற்றிகரமாக நிறைவடைந்தது!
                Purchase Successful!
                
                விவசாயி / Farmer: ${farmer.name}
                மாவட்டம் / District: ${farmer.district}
                அளவு / Quantity: ${qty} kg
                விலை / Price: ₹${farmer.price}/kg
                மொத்த தொகை / Total Amount: ₹${totalAmount}
                
                வாங்குபவர் / Buyer: ${buyerName}
                துறை / Department: ${buyerDept}
                அடையாள எண் / ID: ${buyerId}
                தேதி / Date: ${new Date().toLocaleDateString('ta-IN')}
            `;
            alert(receipt);
        }
    });
    
    // Add clear data button functionality (for development/testing)
    const clearDataBtn = document.createElement('button');
    clearDataBtn.textContent = 'Clear All Data (Admin Only)';
    clearDataBtn.className = 'btn btn-danger btn-sm mt-3';
    clearDataBtn.style.display = 'none'; // Hidden by default
    document.querySelector('main').appendChild(clearDataBtn);
    
    // Show clear button when holding Shift+Ctrl
    document.addEventListener('keydown', function(e) {
        if (e.shiftKey && e.ctrlKey) {
            clearDataBtn.style.display = 'block';
        }
    });
    
    clearDataBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to delete ALL farmer data? This cannot be undone!')) {
            localStorage.removeItem('nattuSakkaraiFarmers');
            farmers = [];
            updateFarmersTable();
            alert('All data has been cleared.');
            clearDataBtn.style.display = 'none';
        }
    });
    
    // Initial table update
    updateFarmersTable();
});