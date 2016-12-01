select *
from yelpBusiness b
join yelpBusinessCategory bc on b.id=bc.businessId
join yelpCategory c on c.id=bc.categoryId
;

select c.id, c.alias, c.title, count(c.alias) as count, city.name
from yelpBusiness b
join city on city.id=b.cityId
join yelpBusinessCategory bc on b.id=bc.businessId
join yelpCategory c on c.id=bc.categoryId
where city.id=1
group by c.alias
order by count desc
;


select b.cityId, yc.alias, yct.level4, yct.level1, count(yct.level1) as count
from yelpBusiness b
join yelpBusinessCategory bc on b.id=bc.businessId
join yelpCategory yc on yc.id=bc.categoryId
join yelpCategoryTree yct on yct.level4=yc.alias
where b.cityId=1
group by yct.level1
order by count desc
;
