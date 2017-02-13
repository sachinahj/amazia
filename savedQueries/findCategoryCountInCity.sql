select *
from yelpBusiness b
join yelpBusinessCategory bc on b.id=bc.businessId
join yelpCategory c on c.id=bc.categoryId
;

-- regular no categoryTree
select c.id, c.alias, c.title, count(c.alias) as count, city.name
from yelpBusiness b
join city on city.id=b.cityId
join yelpBusinessCategory bc on b.id=bc.businessId
join yelpCategory c on c.id=bc.categoryId
where city.id=1
group by c.alias
order by count desc
;

-- by city id
select b.cityId, yct.aliasLevel4, count(yct.aliasLevel4) as count
from yelpBusiness b
join yelpBusinessCategory bc on b.id=bc.businessId
join yelpCategory yc on yc.id=bc.categoryId
join yelpCategoryTree yct on yct.aliasLevel4=yc.alias
where b.cityId=1
group by yct.aliasLevel4
order by count desc
;


-- by zip code
select b.locationZipCode, yct.aliasLevel4, count(yct.aliasLevel4) as count
from yelpBusiness b
join yelpBusinessCategory bc on b.id=bc.businessId
join yelpCategory yc on yc.id=bc.categoryId
join yelpCategoryTree yct on yct.aliasLevel4=yc.alias
where b.locationZipCode=30318
group by yct.aliasLevel4
order by count desc
;

-- all grouped by zipCode and aliasLevel

select
  b.locationZipCode,
  yct.aliasLevel1,
  count(yct.aliasLevel1) as count,
  b.cityId

from yelpBusiness b

join yelpBusinessCategory bc on b.id=bc.businessId
join yelpCategory yc on yc.id=bc.categoryId
join yelpCategoryTree yct on yct.aliasLevel1=yc.alias

and b.locationZipCode != ""

group by b.locationZipCode, yct.aliasLevel1
order by b.locationZipCode, count desc
;
