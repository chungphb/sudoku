/*
	Dau vao: Mang hai chieu 9x9 luu tru cau hinh ban dau cua bai toan Sudoku.
	
						[  ,  ,  , 2,  ,  ,  ,  ,  ]
						[  ,  ,  ,  ,  ,  , 3,  , 8]
						[ 5,  , 3, 1, 9,  ,  ,  , 6]
						[  ,  ,  , 9,  ,  ,  ,  ,  ]
						[ 4, 2,  ,  , 3,  ,  ,  ,  ]
						[  , 3,  ,  , 2, 6, 1,  ,  ]
						[  ,  , 9,  ,  ,  ,  , 2,  ]
						[ 2, 4,  , 7,  ,  , 8,  ,  ]
						[ 3,  , 7,  , 1,  ,  ,  ,  ]
	
	Dau ra: Mot phuong an dien cac so tu 1 - 9 vao cac o trong trong cau hinh ban dau de thoa man cac rang buoc cua bai toan Sudoku.
	Cac rang buoc nay bao gom:
		1. Khong co 2 so giong nhau nam trong cung mot hang.
		2. Khong co 2 so giong nhau nam trong cung mot cot.
		3. Khong co 2 so giong nhau nam trong cung mot luoi 3x3 da duoc quy dinh san.
	
						[ 6, 8, 4, 2, 7, 3, 5, 9, 1]
						[ 1, 9, 2, 6, 4, 5, 3, 7, 8]
						[ 5, 7, 3, 1, 9, 8, 2, 4, 6]
						[ 7, 6, 5, 9, 8, 1, 4, 3, 2]
						[ 4, 2, 1, 5, 3, 7, 6, 8, 9]
						[ 9, 3, 8, 4, 2, 6, 1, 5, 7]
						[ 8, 1, 9, 3, 6, 4, 7, 2, 5]
						[ 2, 4, 6, 7, 5, 9, 8, 1, 3]
						[ 3, 5, 7, 8, 1, 2, 9, 6, 4]
	
		
*/

// Mang T luu tru cau hinh hien tai cua bang sudoku.
var T = Array.from(new Array(9), () => new Array(9).fill(0));

// Mang Tref luu tru luoi HTML tuong ung voi cac gia tri duoc luu o T.
var Tref = Array.from(new Array(9), () => new Array(9));

// Mang Tsol luu tru cau hinh bang ket qua.
var Tsol = Array.from(new Array(9), () => new Array(9).fill(0));

var digits = new Array(10);			// Luu tru cac chu so 1, 2, 3, 4, 5, 6, 7, 8, 9
var hyp = false;					// Cho biet trang thai hien tai la co dinh hay tam thoi
var hyps = []						// Danh sach cac o duoc dien gia tri o trang thai tam thoi

// Toa do cua o hien tai
var curX = 0;
var curY = 0;

var col1 = "#B00";
var col2 = "#0A85FF";

// Ham xao tron cac phan tu cua mot mang.
function shuffle(array) {
    let counter = array.length;
    while (counter > 0) {
        let index = Math.floor(Math.random() * counter);
        counter--;
		
		// Swap(array[counter], array[index])
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}

// Ham xao tron vi tri cac phan tu cua mot mang.
function randomOrderCells() {
    var i, j;
    var arr = []
    for (i = 0; i < 9; i++) {
        for (j = 0; j < 9; j++) {
            arr.push([i,j]);
        }
    }
    return shuffle(arr);
}

// Ham thiet lap gia tri phan tu o o (y, x) của Tref.
function setCell(y, x, n) {
    if (n == 0) {
		Tref[y][x].innerHTML = "";
    } else {
		Tref[y][x].innerHTML = n.toString();
	}
}

// Ham cap nhat gia tri cac phan tu cua mang T sang mang Tref.
function updateGrid() {
    var i, j;
    for(i = 0; i < 9; i++) {
        for(j = 0; j < 9; j++) {
            setCell(i, j, T[i][j]);
            Tref[i][j].style.color = '';
            Tref[i][j].style.backgroundColor = '';
        }
    }
}

// Ham khoi tao cac gia tri ban dau.
function init() {
    var i, j;
    var tbl = document.getElementById("grid");
    for(i = 0; i < 9; i++) {
        var r = tbl.insertRow(-1);
        r.className = "gridRow";
		
        for(j = 0; j < 9; j++) {
            Tref[i][j] = r.insertCell(-1);
            Tref[i][j].className = "gridCell";
			
			/* Them className cho cac o nam tren bien cua moi luoi con 3x3 trong luoi Tref.
									leftBorder 	 					
										 |	   			
										 |	   								
										 v     
										
					topBorder -------->	[*, *, *]
										[*, *, *]
				 bottomBorder --------> [*, *, *]
											   ^
											   |
											   |
										  rightBorder
			*/
			
            if (i%3 == 0) Tref[i][j].className += " topBorder";
            if (i%3 == 2) Tref[i][j].className += " bottomBorder";
            if (j%3 == 0) Tref[i][j].className += " leftBorder";
            if (j%3 == 2) Tref[i][j].className += " rightBorder";
			
            var y = document.createAttribute("y");
            var x = document.createAttribute("x");
            var click = document.createAttribute("clickable");            
			click.value = 0;
            y.value = i;
            x.value = j;
			
            Tref[i][j].setAttributeNode(y);
            Tref[i][j].setAttributeNode(x);
            Tref[i][j].setAttributeNode(click);
        }
    }
	
    // Xu ly su kien click vao mot o tren bang sudoku.
    $("#grid").on("click", "td", function(e) {
        clickCell(this);
        e.stopPropagation();
    });
	
    // Mang cac chu so tu 0 - 9, cho phep lua chon gia tri cua cac o tren bang sudoku.
    for(i = 0; i < 10; i++) {
        digits[i] = document.getElementById("digit-" + String(i));
	}
	
    /* Nhom nut buttons1 co chua ba nut but1, but2 va but3. Trong do:
		- but1 
			+ Cho phep chuyen tu trang thai co dinh -> trang thai tam thoi. 
			+ Duoc dung khi nguoi dung muon thuc hien doan gia tri cac o.
		- but2 
			+ Cho phep chuyen tu trang thai tam thoi -> trang thai co dinh. 
			+ Duoc dung khi nguoi dung muon luu tru cac phep doan cua minh.
		- but3 
			+ Cho phep xoa trang thai tam thoi va quay ve trang thai co dinh truoc do. 
			+ Duoc dung khi nguoi dung khong muon luu tru cac phep doan cua minh. 
	*/
    i = $('#digits').height();
    j = $('#buttons1').height();
    j = Math.floor((i - j)/2) + 4;
	
    $('#buttons1').height(i - j);
    $('#buttons1').css("margin-top", String(j) + "px");
	
    document.getElementById("digits").style.display = "none";
    document.getElementById("but1").style.color = "#000";
    document.getElementById("but2").style.color = "#B8B8B8";
    document.getElementById("but3").style.color = "#B8B8B8";

    setTimeout(function() { 
		getRandomGrid(96); 
	}, 250);
}

// Ham xac dinh cac gia tri hop le cua A[y][x].
function allowed(A, y, x) {
    var i;
	
	// Mang luu tru danh sach cac gia tri hop le cua A[y][x].
    var res = [];			

	// Mang boolean danh dau cac gia tri v ma phep gan A[y][x] = v co the dan den vi pham cac rang buoc cua bai toan Sudoku.
    var arr = new Array(10).fill(true);
	
	// Khi o da duoc dien.
    if (A[y][x] > 0) {
		return res;
	}
	
	// Cac gia tri da duoc dien o cac o cung HANG voi o hien tai se khong  hop le voi o nay.
    for(i = 0; i < 9; i++) {
		arr[A[y][i]] = false;
	}
	
	// Cac gia tri da duoc dien o cac o cung COT voi o hien tai se khong con hop le voi o nay.
    for(i = 0; i < 9; i++) {
		arr[A[i][x]] = false;
	}
	
	// Cac gia tri da duoc dien o cac o cung LUOI 3x3 voi o hien tai se khong con hop le voi o nay.
    for(i = 0; i < 9; i++) {
        arr[A[ y - (y%3) + Math.floor(i/3)][x - (x%3) + (i%3)]] = false;
	}
	
    for(i = 1; i < 10; i++) {
        if(arr[i]) {
			res.push(i);
		}
	}
	
    return res;
}

// Ham xac dinh o (trong) co so gia tri hop le la nho nhat.
function bestHypothesis(A) {
    var i, j, s;
    var bSc = 10;
    var bCoords = [9, 9];
    var bAll = [];
	
    for(i = 0; i < 9; i++) {
        for(j = 0; j < 9; j++) {
            if (A[i][j] == 0) {
                s = allowed(A, i, j);
                n = s.length;
                if (n < bSc) {
                    bSc = n;
                    bCoords = [i, j];
                    bAll = s;
                }
            }
        }
    }
	
    return [bAll, bCoords[0], bCoords[1]];
}

// Ham tra ve mot phuong an de giai bai toan sudoku doi voi mot cau hinh T cu the (neu co).
function _findAcceptableGrid() {
    var i;
    var [all, y, x] = bestHypothesis(T);
	
	// Neu tat ca cac o trong bang sudoku deu da duoc dien, ta co mot phuong an hop le.
    if (y == 9) {
		return true;
	}
	
	// Neu so luong gia tri hop le cua mot o (trong) nao day bang 0, cau hinh hien tai la khong hop le.
    if (all.length == 0) {
		return false;
	}
	
	/* Thu tuc quay lui.
	   Lan luot lay tung gia tri hop le trong all va gan cho T[y][x]. 
	   Voi moi phep gan nay, ta goi de quy de tiep tuc thuc hien thu tuc voi nhung o (trong) con lai trong bang. 
	   Neu cac phep gan dan den mot phuong an dung, ham tra ve true. 
	   Nguoc lai, neu o mot buoc nao do, ta thu duoc ket qua false, ta quay ve buoc truoc do va gan mot gia tri khac cho o tuong ung.
	*/
	
    all = shuffle(all);
    for (i = 0; i < all.length; i++) {
        T[y][x] = all[i];
        if(_findAcceptableGrid()) {
			return true;
		}
    }
}

// Ham tra ve mot cau hinh bat ky thoa man bai toan sudoku.
function findAcceptableGrid() {
	// Khoi tao cau hinh rong.
    var i, j;
    for(i = 0; i < 9; i++) {
		for(j = 0; j < 9; j++) {
			T[i][j] = 0; 
		}
	}
	
	/* Tim mot cau hinh bat ky thoa man bai toan sudoku.
	   Luu y: Dong lenh all = shuffle(all) trong ham _findAcceptableGrid() dam bao cac cau hinh hop le duoc chon la ngau nhien, khong bi ghi de len cau hinh truoc do.
    */
	while(_findAcceptableGrid() != true) {
        for(i = 0; i < 9; i++) {
			for(j = 0; j < 9; j++) { 
				T[i][j] = 0; 
			}
		}
	}
	
	// Luu tru cau hinh tim duoc vao bang Tsol.
    for(i = 0; i < 9; i++) {
		for(j = 0; j < 9; j++) {
			Tsol[i][j] = T[i][j];
		}
	}		
}

// Ham kiem tra so luong phuong an hop le cua mot cau hinh
function _findValidityClass(A, n) {
    var i;
    var sol = -1;
    var [all, y, x] = bestHypothesis(A);
	
	// Neu tat ca cac o trong bang sudoku deu duoc dien, ta co 1 phuong an hop le.
    if (y == 9) {
		return 1;
	}
	
	// Neu so luong gia tri hop le cua mot o (trong) nao day bang 0, ta co 0 phuong co hop le.
    if (all.length == 0) {
		return -1; 
	}
	// if (all.length > 1) n++; // make a new hypothesis
	
    for (i = 0; i < all.length; i++) {
        A[y][x] = all[i];
        r = _findValidityClass(A, n);
        A[y][x] = 0;
        if (r >= 0) {
            if (sol >= 0) {
				return -2; 
			}
            // sol = r;
			// Danh dau la da co 1 phuong an duoc xac dinh cho cau hinh nay.
            sol = all.length * r;
        } else if (r == -2) {
			return -2;
		}
    }
	
    return sol;
}

/* Ham tao ra mot cau hinh ban dau cua bai toan.
   Tham so nlevel mo ta do kho cua cau hinh nay. 
   Trong do: De = 72, Trung binh = 96, Kho = 128, Rat kho = 192.
*/
function _getRandomGrid2(nlevel) {
    var i, j, v, y1, x1, y2, x2, s;
    var sc = -2;
    var zeros = [];
    var kept = [];
	
	// Luu tru vi tri cac o trong bang sudoku vao mang mot chieu kept.
    for(i = 0; i < 9; i++) { 
		for(j = 0; j < 9; j++) {
			kept.push([i,j]); 
		}
	}
	
	// Tim mot cau hinh bat ky thoa man noi dung bai toan. 
    findAcceptableGrid();
	
	
    for(i = 0; i < nlevel; i++) {
		// Chon mot vi tri (y1, x1) bat ky va thiet lap gia tri bang T tai vi tri tuong ung (xoa gia tri T[y1][x1])
        j = Math.floor(Math.random() * kept.length);
        y1 = kept[j][0]; 
		x1 = kept[j][1];
        T[y1][x1] = 0;
		
		// Tinh so luong phuong an hop le tuong ung voi cau hinh duoc tao sau khi xoa T[y1][x1].
        v = _findValidityClass(T, 0);
        if(v < 0) {
			// Neu cau hinh hien tai co nhieu hon mot phuong an hop le, khoi phuc cau hinh truoc khi thiet lap.
			T[y1][x1] = Tsol[y1][x1];
        } else {
			// Nguoc lai, xoa gia tri (y1, x1) trong kept va bo sung no vao zeros.
            sc = v; 
			zeros.push([y1,x1]);
            kept[j] = kept[kept.length - 1]; 
			kept.pop();
        }
		
		// Chon mot gia tri (y1, x1) bat ky trong kept. 
        j = Math.floor(Math.random() * kept.length);
        y1 = kept[j][0]; 
		x1 = kept[j][1];
        
		// Chon mot gia tri (y2, x2) bat ky trong zeros.
		s = Math.floor(Math.random() * zeros.length);
        y2 = zeros[s][0]; 
		x2 = zeros[s][1];
		
		// Thiet lap gia tri bang T tai cac vi tri tuong ung (xoa T[y1][x1], khoi phuc T[y2][x2]). 
		T[y1][x1] = 0; 
		T[y2][x2] = Tsol[y2][x2];
        
		// Tinh so luong phuong an hop le tuong ung voi cau hinh duoc tao
		v = _findValidityClass(T, 0);
        if(v < sc) {
			// Neu cau hinh hien tai co nhieu hon mot phuong an hop le, khoi phuc cau hinh truoc khi thiet lap.
            T[y1][x1] = Tsol[y1][x1];
            T[y2][x2] = 0;
        } else {
			// Nguoc lai, thay the (y1, x1) vao vi tri cua (y2, x2) trong zeros va thay the (y2, x2) vao vi tri cua (y1, x1) trong kept
            sc = v;
            zeros[s] = [y1, x1];
            kept[j] = [y2, x2];
        }
    }
    return sc;
}

/*
// Mot ham khac duoc su dung de tao ra mot cau hinh ban dau cua bai toan.
function _getRandomGrid2(nlevel) {
    var i, j, k, v, y1, x1, y2, x2, x3, y3, s;
    var sc = -2;
    var zeros = [];
    var kept = [];
    
	for(i = 0; i < 9; i++) { 
		for(j = 0; j < 9; j++) {
			kept.push([i,j]); 
		}
	}
    
	findAcceptableGrid();
    
	for(i = 0; i < nlevel; i++) {
        // first step
        j = Math.floor(Math.random() * kept.length);
        y1 = kept[j][0]; 
		x1 = kept[j][1];
        T[y1][x1] = 0;
        v = _findValidityClass(T, 0);
        
		if(v < 0) {
			T[y1][x1] = Tsol[y1][x1];
        } else {
            sc = v; 
			zeros.push([y1,x1]);
            kept[j] = kept[kept.length-1]; 
			kept.pop();
        }
		
        // second step
        j = Math.floor(Math.random() * kept.length);
        k = Math.floor(Math.random() * (kept.length-1));
		
        if (j == k) {
			k = kept.length - 1;
		}
		
        if (j < k) { 
			s = j;
			j = k;
			k = s; 
		}
		
        y1 = kept[j][0]; 
		x1 = kept[j][1];
        y2 = kept[k][0]; 
		x2 = kept[k][1];
        
		s = Math.floor(Math.random() * zeros.length);
        y3 = zeros[s][0]; 
		x3 = zeros[s][1];
        
		T[y1][x1] = 0; 
		T[y2][x2] = 0; 
		T[y3][x3] = Tsol[y3][x3];
        v = _findValidityClass(T, 0);
        
		if(v < sc) {
            T[y1][x1] = Tsol[y1][x1];
            T[y2][x2] = Tsol[y2][x2];
            T[y3][x3] = 0;
        } else {
            sc = v;
            zeros[s] = [y1, x1]; 
			zeros.push([y2,x2]);
            kept[j] = kept[kept.length-1]; 
			kept.pop();
            kept[k] = [y3, x3];
        }
    }
    return sc;
}
*/

// Ham thiet lap luoi Tref. 
function _getRandomGrid(nlevel) {
    console.log(_getRandomGrid2(nlevel));
    updateGrid();

    for(i = 0; i < 9; i++) {
        for(j = 0; j < 9; j++) {
            if (T[i][j] == 0) {
				// Cac o can duoc dien so.
				Tref[i][j].setAttribute("clickable", 1);
            } else {
				// Cac o da duoc dien san so trong cau hinh khoi tao.
				Tref[i][j].setAttribute("clickable", 0);
			}
        }
    }
    
	// make clickable
    $( "#waiting" ).popup( "close" )
    
	// $.mobile.loading().hide();
    hyp = false;
    document.getElementById("but1").style.color = "#000";
    document.getElementById("but2").style.color = "#B8B8B8";
    document.getElementById("but3").style.color = "#B8B8B8";
}

// Ham hien thi thong bao cho thiet lap giao dien bang Sudoku
function getRandomGrid(nlevel) {
    $("#waiting").popup("open")
    
	//$.mobile.loading().show();
    setTimeout(function() { 
		_getRandomGrid(nlevel); 
	}, 0);
}

// Ham thiet lap giao dien mot so thanh phan khac
function elsewhere() {
    Tref[curY][curX].style.backgroundColor = "";
    document.getElementById("digits").style.display = "none";
    document.getElementById("buttons1").style.display = "inline-block";
}

// Ham thiet lap giao dien khi mot o bat ky tren luoi duoc click.
function clickCell(cell) {
    var c = Number(cell.getAttribute("clickable"));
    if (c == 1) {
		// Lay toa do cua o hien tai va hay doi mau background cua o nay.
        var y = Number(cell.getAttribute("y"));
        var x = Number(cell.getAttribute("x"));
		Tref[curY][curX].style.backgroundColor = "";
        $("#digits").off("click", "**");
        curY = y;
        curX = x;
        cell.style.backgroundColor = "#BBB";
        
		// Hien thi bang cac chu so hop le.
		document.getElementById("digits").style.display = "inline-block";
		
		// Tat hien thi nhom nut buttons1.
        document.getElementById("buttons1").style.display = "none";
        
		// Tim cac gia tri hop le co the dien vao o hien tai.
		var a = allowed(T, y, x);
        var d = new Array(10).fill(false);
        
		for(i = 0; i < a.length; i++) { 
			d[a[i]] = true;
		}
        
		d[0] = true;
        for(i = 0; i < 10; i++) {
            if (d[i]) {
                let v = i;
                let col = (hyp)? col2: col1;
				/* Bien col, tuc color, co the nhan mot trong hai gia tri:
					- col2, tuong ưng voi hyp = true, khi nguoi dung dang o trang thai tam thoi (dang thuc hien cac phep doan).
					- col1, tuong ung voi hyp = false, khi nguoi dung dang o trang thai co dinh (khi nguoi dung muon luu tru ngay cac phep doan).
				*/				
                let h = hyp;
                
				digits[i].style.color = col;
                digits[i].style.borderColor = col;
                
				// Thay doi gia tri mang T va luoi Tref khi nguoi dung click vao nut digit-i.
				$("#digits").on("click", "#digit-" + String(i), function(e) {
                    T[y][x] = v;
                    setCell(y, x, v);
                    Tref[y][x].style.color = col;
					
					// Luu tru gia tri Tref[y][x] vao mang hyps neu nguoi dung dang o trang thai co dinh  .
                    if (h) {
						hyps.push(Tref[y][x]);
					}
                    //e.stopPropagation();
                });
            } else {
                digits[i].style.color = "#B8B8B8";
                digits[i].style.borderColor = "#B8B8B8";
                digits[i].style.cursor = "pointer";
            }
        }
    } else {
		elsewhere();
	}
}

// Ham thiet lap giao dien ung dung khi but1 duoc bam.
function hypothesis1() {
    if(!hyp) {
        document.getElementById("but1").style.color = "#B8B8B8";
        document.getElementById("but2").style.color = "#000";
        document.getElementById("but3").style.color = "#000";
        hyp = true;
    }
}

// Ham thiet lap giao dien ung dung khi but2 duoc bam.
function hypothesis2() {
    var i;
    console.log(hyps);
	
	// Thay doi mau cua cac gia tri duoc luu trong bang hyps 
    for(i = 0; i < hyps.length; i++) {
		hyps[i].style.color = col1;
	}	
    hyps = []
    hyp = false;
	
    document.getElementById("but1").style.color = "#000";
    document.getElementById("but2").style.color = "#B8B8B8";
    document.getElementById("but3").style.color = "#B8B8B8";
}

// Ham thiet lap giao dien ung dung khi but3 duoc bam.
function hypothesis3() {
    var i;
    console.log(hyps);
	
	// Xoa bo cau hinh o trang thai tam thoi (xoa bo cac phep doan cua nguoi dung o trang thai tam thoi).
    for(i = 0; i < hyps.length; i++) {
        hyps[i].innerHTML = "";
        var y = Number(hyps[i].getAttribute("y"));
        var x = Number(hyps[i].getAttribute("x"));
        T[y][x] = 0;
    }
	
    hyps = []
    hyp = false;
    document.getElementById("but1").style.color = "#000";
    document.getElementById("but2").style.color = "#B8B8B8";
    document.getElementById("but3").style.color = "#B8B8B8";
}

// Ham bat dau lai.
function restart() {
	// Xoa cac ket qua da duoc luu tru. 
    var i, j;
    for(i = 0; i < 9; i++) {
        for(j = 0; j < 9; j++) {
            if(Number(Tref[i][j].getAttribute("clickable")) == 1) {
                T[i][j] = 0;
                setCell(i,j,0);
            }
        }
    }
	
    hyp = false;
    document.getElementById("but1").style.color = "#000";
    document.getElementById("but2").style.color = "#B8B8B8";
    document.getElementById("but3").style.color = "#B8B8B8";
}

// Ham khoi tao mot cau hinh moi.
function newRandomGrid(nlevel) {
    $("#newGrid").popup("close");
    setTimeout(function() { 
		getRandomGrid(nlevel); 
	}, 250);
}

// Ham hien thi phuong an cua bai toan Sudoku.
function solve() {
    for(i = 0; i < 9; i++) {
        for(j = 0; j < 9; j++) {
            if(T[i][j] == 0) {
				// Doi voi cac o chua duoc dien.
                T[i][j] = Tsol[i][j];
                setCell(i,j, T[i][j]);
                Tref[i][j].style.color = "#B8B8B8";
            } else if (T[i][j] != Tsol[i][j]) {
				// Doi voi cac o bi dien sai.
                T[i][j] = Tsol[i][j];
                setCell(i,j, T[i][j]);
                Tref[i][j].style.color = "#B8B8B8";
                Tref[i][j].style.backgroundColor = "#FBB";
            }
        }
    }
    hyp = false;
    
	document.getElementById("but1").style.color = "#000";
    document.getElementById("but2").style.color = "#B8B8B8";
    document.getElementById("but3").style.color = "#B8B8B8";
}

// Ham kiem tra nhung o khong trung voi dap an.
function check() {
    for(i = 0; i < 9; i++) {
        for(j = 0; j < 9; j++) {
            if ((T[i][j] != Tsol[i][j]) && (T[i][j] != 0)) {
                Tref[i][j].style.backgroundColor = "#FBB";
            }
        }
    }
}
