	$(document).ready(function() {
		getResults();
	});

	function getResults() {
		// Should get these from the index.html
		var lon = -93.29;
		var lat = 44.92;
		var radius = 100;
		
		var spacesURL = 'http://michaelaltmann.cartodb.com/api/v2/sql';
		var vacancyURL = 'http://michaelaltmann.cartodb.com/api/v2/sql';

		$.getJSON(spacesURL, {
			q : "select sum(parking_supply.spaces) as tot from parking_supply where ST_Distance_Sphere(the_geom,ST_MakePoint("+lon+","+lat+")) < " + radius
		}, function(data) {
			var spaces = data.rows[0].tot;
			spaces = Math.round(spaces);
			$('#before_spaces').text(spaces);
			$('#option1_spaces').text(spaces);
		});
		var current_vacancy_query = "with x as (select s.the_geom, s.the_geom_webmercator, s.address, s.spaces, \n" +
		" s.spaces - COALESCE(( \n" +
		"  select s.spaces * sum( d.cars * (100 - ST_Distance_sphere(s.the_geom, d.the_geom) ) / \n" +
		"  -- total affinity for this row in parking_demand \n" +
		"  (select \n" +
		"  sum( s2.spaces * (100 - ST_Distance_sphere(s2.the_geom, d.the_geom) ) ) \n" +
		"  from parking_supply as s2 \n" +
		"  where ST_Distance_sphere(s2.the_geom, d.the_geom) < 100) \n" +
		"  ) \n" +
		"  from parking_demand as d \n" +
		"  where ST_Distance_sphere(s.the_geom, d.the_geom) < 100 \n" +
		"  and  option is null \n" +
		"  ),0) as vacancy \n" +
		" from parking_supply as s) select sum(x.vacancy) as tot from x where ST_Distance_Sphere(x.the_geom,ST_MakePoint("+lon+","+lat+")) < " + radius;

		var option1_vacancy_query = "with x as (select s.the_geom, s.the_geom_webmercator, s.address, s.spaces, \n" +
		" s.spaces - COALESCE(( \n" +
		"  select s.spaces * sum( d.cars * (100 - ST_Distance_sphere(s.the_geom, d.the_geom) ) / \n" +
		"  -- total affinity for this row in parking_demand \n" +
		"  (select \n" +
		"  sum( s2.spaces * (100 - ST_Distance_sphere(s2.the_geom, d.the_geom) ) ) \n" +
		"  from parking_supply as s2 \n" +
		"  where ST_Distance_sphere(s2.the_geom, d.the_geom) < 100) \n" +
		"  ) \n" +
		"  from parking_demand as d \n" +
		"  where ST_Distance_sphere(s.the_geom, d.the_geom) < 100 \n" +
		"  and  (option is null or option = '1') \n" +
		"  ),0) as vacancy \n" +
		" from parking_supply as s) select sum(x.vacancy) as tot from x where ST_Distance_Sphere(x.the_geom,ST_MakePoint("+lon+","+lat+")) < " + radius;

		
		$.getJSON(vacancyURL, {
			q : (current_vacancy_query)
		}, function(data) {
			var vacancy = data.rows[0].tot;
			vacancy = Math.round(vacancy);
			$('#before_vacancy').text(vacancy);
		});

		$.getJSON(vacancyURL, {
			q : (option1_vacancy_query)
		}, function(data) {
			var vacancy = data.rows[0].tot;
			vacancy = Math.round(vacancy);
			$('#option1_vacancy').text(vacancy);
		});

	}