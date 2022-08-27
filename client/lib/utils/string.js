export function optimalStringAlignmentDistance(s, t) {
    // Determine the "optimal" string-alignment distance between s and t
    if (!s || !t) {
      return 99;
    }
    var m = s.length;
    var n = t.length;
    
    /* For all i and j, d[i][j] holds the string-alignment distance
     * between the first i characters of s and the first j characters of t.
     * Note that the array has (m+1)x(n+1) values.
     */
    var d = new Array();
    for (var i = 0; i <= m; i++) {
      d[i] = new Array();
      d[i][0] = i;
    }
    for (var j = 0; j <= n; j++) {
      d[0][j] = j;
    }
          
    // Determine substring distances
    var cost = 0;
    for (var j = 1; j <= n; j++) {
      for (var i = 1; i <= m; i++) {
        cost = (s.charAt(i-1) == t.charAt(j-1)) ? 0 : 1;   // Subtract one to start at strings' index zero instead of index one
        d[i][j] = Math.min(d[i][j-1] + 1,                  // insertion
                           Math.min(d[i-1][j] + 1,         // deletion
                                    d[i-1][j-1] + cost));  // substitution
                          
        if(i > 1 && j > 1 && s.charAt(i-1) == t.charAt(j-2) && s.charAt(i-2) == t.charAt(j-1)) {
          d[i][j] = Math.min(d[i][j], d[i-2][j-2] + cost); // transposition
        }
      }
    }
    
    // Return the strings' distance
    return d[m][n];
  }
  