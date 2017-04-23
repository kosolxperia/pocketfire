//1. http://stackoverflow.com/questions/35879695/promise-all-with-firebase-datasnapshot-foreach
function loadMeetings(city,state) {
    //$('#meetingsTable').empty();
    return ref.child('states').child(state).child(city).once('value').then(function(snapshot) {
        var reads = [];
//      ^^^^^^^^^^^^^^
        snapshot.forEach(function(childSnapshot) {
            var id = childSnapshot.key();
            var promise = ref.child('meetings').child(id).once('value').then(function(snap) {
                // The Promise was fulfilled.
            }, function(error) {
                // The Promise was rejected.
                console.error(error);
            });
            reads.push(promise);
        });
        return Promise.all(reads);
//      ^^^^^^^^^^^^^^^^^
    }, function(error) {
        // The Promise was rejected.
        console.error(error);
    }).then(function(values) {
        console.log(values); // [snap, snap, snap]
    });
}

// end 1.




// 2. http://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically
/*
* Recursively merge properties of two objects
*/
function MergeRecursive(obj1, obj2) {

  for (var p in obj2) {
    try {
      // Property in destination object set; update its value.
      if ( obj2[p].constructor==Object ) {
        obj1[p] = MergeRecursive(obj1[p], obj2[p]);

      } else {
        obj1[p] = obj2[p];

      }

    } catch(e) {
      // Property in destination object not set; create it and set its value.
      obj1[p] = obj2[p];

    }
  }

  return obj1;
}
// end 2


// 3. https://gist.github.com/katowulf/6598238
function extend(base) {
    var parts = Array.prototype.slice.call(arguments, 1);
    parts.forEach(function (p) {
        if (p && typeof (p) === 'object') {
            for (var k in p) {
                if (p.hasOwnProperty(k)) {
                    base[k] = p[k];
                }
            }
        }
    });
    return base;
}

/*
use:

var fb = new Firebase("https://examples-sql-queries.firebaseio.com/");
fb.child('user/123').once('value', function(userSnap) {
   fb.child('media/123').once('value', function(mediaSnap) {
       // extend function: https://gist.github.com/katowulf/6598238
       console.log( extend({}, userSnap.val(), mediaSnap.val()) );
       var temp;
       temp=extend(temp, userSnap.val(), mediaSnap.val())
   });
});

*/

// end 3
